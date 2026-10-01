import fs from "node:fs/promises";
import { parseEnv } from "node:util";

export const DATABASE_NAME = "platformtraining";
export const DEFAULT_PORT = 8840;
export const DEFAULT_CHANNEL = "pl-stable";

/**
 * Load and validate the service configuration from `.env` at the package root.
 * Secret values are validated but never logged or returned in error messages.
 */
export async function loadConfig(root = new URL("../", import.meta.url)) {
  const env = parseEnv(await fs.readFile(new URL(".env", root), "utf8"));
  return configFromEnv(env);
}

export function configFromEnv(env) {
  const databaseUrl = env.TRAINING_DATABASE_URL;
  if (!databaseUrl) throw new Error("TRAINING_DATABASE_URL is required");
  if (new URL(databaseUrl).pathname !== `/${DATABASE_NAME}`) {
    throw new Error(`Only the ${DATABASE_NAME} database is permitted`);
  }
  const signingSecret = env.TRAINING_SIGNING_SECRET;
  if (typeof signingSecret !== "string" || signingSecret.length < 32) {
    throw new Error("TRAINING_SIGNING_SECRET must be at least 32 characters");
  }
  const port = Number(env.TRAINING_PORT || DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("TRAINING_PORT must be a valid port number");
  }
  return {
    databaseUrl,
    signingSecret,
    port,
    channel: env.TRAINING_CHANNEL || DEFAULT_CHANNEL,
  };
}
