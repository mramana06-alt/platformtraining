import fs from "node:fs/promises";
import path from "node:path";
import { parseEnv } from "node:util";
import { randomBytes } from "node:crypto";
import pg from "pg";
import { digest } from "../src/auth.mjs";
import { DATABASE_NAME, DEFAULT_PORT } from "../src/config.mjs";

/*
 * One-time and repeatable setup:
 *  1. keep the original (migrator) connection privately in .local/migrator.env;
 *  2. create the platformtraining database if it is missing;
 *  3. apply checksummed migrations from ./migrations in order;
 *  4. create the restricted runtime role and grant the minimum;
 *  5. point .env at the runtime role and add a signing secret and port if absent.
 * Credentials are never printed.
 */

const root = path.resolve(import.meta.dirname, "..");
const RUNTIME_ROLE = "platformtraining_runtime";

await fs.mkdir(path.join(root, ".local"), { recursive: true });
await fs.mkdir(path.join(root, ".runtime"), { recursive: true });

const originalEnvText = await fs.readFile(path.join(root, ".env"), "utf8");
const migratorEnvPath = path.join(root, ".local", "migrator.env");
let migratorEnv;
try {
  migratorEnv = parseEnv(await fs.readFile(migratorEnvPath, "utf8"));
} catch {
  await fs.writeFile(migratorEnvPath, originalEnvText, { flag: "wx" });
  migratorEnv = parseEnv(originalEnvText);
}

const migratorUrl = new URL(migratorEnv.TRAINING_DATABASE_URL);
if (migratorUrl.pathname !== `/${DATABASE_NAME}`) throw new Error(`Only the ${DATABASE_NAME} database is permitted`);

// 2. database
const adminUrl = new URL(migratorUrl);
adminUrl.pathname = "/postgres";
const admin = new pg.Client({ connectionString: adminUrl.href });
await admin.connect();
try {
  const exists = (await admin.query("select 1 from pg_database where datname = $1", [DATABASE_NAME])).rowCount;
  if (!exists) await admin.query(`CREATE DATABASE ${DATABASE_NAME}`);
  console.log(exists ? `Using existing ${DATABASE_NAME} database` : `Created ${DATABASE_NAME} database`);
} finally {
  await admin.end();
}

const db = new pg.Client({ connectionString: migratorUrl.href });
await db.connect();
try {
  // 3. migrations
  const unmanaged = (
    await db.query(
      "select tablename from pg_tables where schemaname = 'training' and not exists (select 1 from information_schema.tables where table_schema = 'training' and table_name = 'migrations')",
    )
  ).rows;
  if (unmanaged.length) throw new Error("Unmanaged training schema found; migration stopped");
  await db.query("BEGIN");
  await db.query("CREATE SCHEMA IF NOT EXISTS training");
  await db.query(
    "CREATE TABLE IF NOT EXISTS training.migrations(version text PRIMARY KEY, hash text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const files = (await fs.readdir(path.join(root, "migrations"))).filter((f) => /^\d{3}-.+\.sql$/.test(f)).sort();
  for (const file of files) {
    const version = file.slice(0, 3);
    const sql = await fs.readFile(path.join(root, "migrations", file), "utf8");
    const hash = digest(sql);
    const applied = (await db.query("select hash from training.migrations where version = $1", [version])).rows[0];
    if (applied && applied.hash !== hash) throw new Error(`Migration ${file} changed after it was applied`);
    if (!applied) {
      await db.query(sql);
      await db.query("insert into training.migrations(version, hash) values ($1, $2)", [version, hash]);
      console.log(`Applied migration ${file}`);
    }
  }

  // 4. runtime role
  const runtimeEnv = parseEnv(await fs.readFile(path.join(root, ".env"), "utf8"));
  const runtimeUrl = new URL(runtimeEnv.TRAINING_DATABASE_URL);
  const role = (await db.query("select rolsuper, rolbypassrls from pg_roles where rolname = $1", [RUNTIME_ROLE])).rows[0];
  if (!role) {
    const password = randomBytes(32).toString("base64url");
    await db.query(`CREATE ROLE ${RUNTIME_ROLE} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD ${pg.escapeLiteral(password)}`);
    runtimeUrl.username = RUNTIME_ROLE;
    runtimeUrl.password = password;
  } else if (role.rolsuper || role.rolbypassrls || runtimeUrl.username !== RUNTIME_ROLE) {
    throw new Error("Existing runtime role requires explicit configuration; no credential changed");
  }
  await db.query(`GRANT CONNECT ON DATABASE ${DATABASE_NAME} TO ${RUNTIME_ROLE}`);
  await db.query(`GRANT USAGE ON SCHEMA training TO ${RUNTIME_ROLE}`);
  await db.query(`GRANT SELECT ON training.packages, training.channels TO ${RUNTIME_ROLE}`);
  await db.query(`GRANT SELECT, INSERT, UPDATE ON training.learners, training.attempts, training.events TO ${RUNTIME_ROLE}`);
  await db.query("COMMIT");

  // 5. .env
  const secret = runtimeEnv.TRAINING_SIGNING_SECRET || randomBytes(48).toString("base64url");
  let output = originalEnvText.replace(/^TRAINING_DATABASE_URL=.*$/m, `TRAINING_DATABASE_URL=${runtimeUrl.href}`);
  if (!/^TRAINING_SIGNING_SECRET=/m.test(output)) output += `\nTRAINING_SIGNING_SECRET=${secret}`;
  if (!/^TRAINING_PORT=/m.test(output)) output += `\nTRAINING_PORT=${DEFAULT_PORT}`;
  await fs.writeFile(path.join(root, ".env"), `${output.trimEnd()}\n`);
  console.log("Migrations applied; restricted runtime role configured; credentials kept private");
} catch (error) {
  await db.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await db.end();
}
