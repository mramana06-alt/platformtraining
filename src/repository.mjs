import pg from "pg";
import { HttpError, digest } from "./auth.mjs";
import { DATABASE_NAME } from "./config.mjs";
import { ActionSchema, EMPTY_LEARNER, PackageSchema } from "./schema.mjs";
import { buildExperience, buildTopicView, reduceProgress } from "./experience.mjs";

/*
 * Data access. Every learner read or write runs inside a transaction that sets
 * the tenant and user GUCs, so PostgreSQL row-level security scopes the rows.
 * Packages are read-only for the runtime role; publishing is a separate CLI.
 */

export async function createRepository(databaseUrl, { channel = "pl-stable" } = {}) {
  if (new URL(databaseUrl).pathname !== `/${DATABASE_NAME}`) throw new Error("Incorrect database");
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 8, connectionTimeoutMillis: 5000 });
  const identity = (
    await pool.query("select current_database() as db, rolsuper, rolbypassrls from pg_roles where rolname = current_user")
  ).rows[0];
  if (identity.db !== DATABASE_NAME || identity.rolsuper || identity.rolbypassrls) {
    await pool.end();
    throw new Error("Unsafe runtime identity: the service must run as a restricted, non-bypass role");
  }

  /** Run `fn` in a transaction scoped to the request's tenant and user. */
  async function scoped(context, fn) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("select set_config('training.tenant', $1, true), set_config('training.user', $2, true)", [
        context.tenantId,
        context.userId,
      ]);
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  /** The package the channel currently points at. Only schema-2 packages are served. */
  async function currentPackage(client) {
    const row = (
      await client.query(
        "select p.version, p.content from training.packages p join training.channels c on c.version = p.version where c.name = $1",
        [channel],
      )
    ).rows[0];
    if (!row) throw new HttpError("Training content is unavailable", 503);
    if (row.content?.schemaVersion !== 2) throw new HttpError("Training content needs to be republished for this player", 503);
    return PackageSchema.parse(row.content);
  }

  async function readLearner(client, context, forUpdate = false) {
    const row = (
      await client.query(
        `select version, payload from training.learners where tenant_id = $1 and user_id = $2${forUpdate ? " for update" : ""}`,
        [context.tenantId, context.userId],
      )
    ).rows[0];
    return row || { version: 0, payload: { ...EMPTY_LEARNER } };
  }

  return {
    pool,
    experience: (context) =>
      scoped(context, async (client) => buildExperience(await currentPackage(client), context, await readLearner(client, context))),
    topic: (context, topicId) =>
      scoped(context, async (client) => buildTopicView(await currentPackage(client), context, await readLearner(client, context), topicId)),
    act: (context, rawAction) =>
      scoped(context, async (client) => {
        const action = ActionSchema.parse(rawAction);
        const requestHash = digest(JSON.stringify(action));
        await client.query("insert into training.learners(tenant_id, user_id) values ($1, $2) on conflict do nothing", [
          context.tenantId,
          context.userId,
        ]);
        const learner = await readLearner(client, context, true);
        const pkg = await currentPackage(client);
        // Idempotency: the same event id returns the original result; a different body for the same id is rejected.
        const previous = (
          await client.query("select request_hash, result from training.events where tenant_id = $1 and user_id = $2 and event_id = $3", [
            context.tenantId,
            context.userId,
            action.eventId,
          ])
        ).rows[0];
        if (previous) {
          if (previous.request_hash !== requestHash) throw new HttpError("Event id reused with different input", 409);
          return buildExperience(pkg, context, previous.result);
        }
        if (learner.version !== action.expectedVersion) throw new HttpError("Training progress changed. Refresh before continuing.", 409);
        const next = reduceProgress(learner, action, pkg);
        await client.query("update training.learners set version = $3, payload = $4, updated_at = now() where tenant_id = $1 and user_id = $2", [
          context.tenantId,
          context.userId,
          next.version,
          next.payload,
        ]);
        await client.query("insert into training.events(tenant_id, user_id, event_id, request_hash, result) values ($1, $2, $3, $4, $5)", [
          context.tenantId,
          context.userId,
          action.eventId,
          requestHash,
          next,
        ]);
        return buildExperience(pkg, context, next);
      }),
  };
}
