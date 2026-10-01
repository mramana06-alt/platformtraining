import fs from "node:fs/promises";
import path from "node:path";
import { parseEnv } from "node:util";
import pg from "pg";
import { digest } from "../src/auth.mjs";
import { DATABASE_NAME, DEFAULT_CHANNEL } from "../src/config.mjs";
import { PackageSchema } from "../src/schema.mjs";

/*
 * Publish a content package. Uses the private migrator credential kept in
 * `.local/migrator.env` (the runtime role cannot publish). A published version
 * is immutable: republishing the same version with different content fails.
 *
 *   node scripts/publish.mjs [content/pl-guide-v2.json] [--channel pl-stable]
 */

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const channelIndex = args.indexOf("--channel");
const channel = channelIndex >= 0 ? args[channelIndex + 1] : DEFAULT_CHANNEL;
const file = args.filter((a, i) => !a.startsWith("--") && i !== channelIndex + 1)[0] || path.join(root, "content", "pl-guide-v2.json");

const env = parseEnv(await fs.readFile(path.join(root, ".local", "migrator.env"), "utf8"));
if (new URL(env.TRAINING_DATABASE_URL).pathname !== `/${DATABASE_NAME}`) throw new Error("Incorrect database");

const pkg = PackageSchema.parse(JSON.parse(await fs.readFile(file, "utf8")));
const hash = digest(JSON.stringify(pkg));

const db = new pg.Client({ connectionString: env.TRAINING_DATABASE_URL });
await db.connect();
try {
  await db.query("BEGIN");
  const existing = (await db.query("select hash, content from training.packages where version = $1", [pkg.version])).rows[0];
  if (existing && digest(JSON.stringify(PackageSchema.parse(existing.content))) !== hash) {
    throw new Error(`Version ${pkg.version} is already published with different content; increment the version`);
  }
  if (!existing) await db.query("insert into training.packages(version, hash, content) values ($1, $2, $3)", [pkg.version, hash, pkg]);
  await db.query("insert into training.channels(name, version) values ($1, $2) on conflict (name) do update set version = excluded.version", [
    channel,
    pkg.version,
  ]);
  await db.query("COMMIT");
  console.log(`Published ${pkg.version} (${pkg.topics.length} topics) to channel ${channel}`);
} catch (error) {
  await db.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await db.end();
}
