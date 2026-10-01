import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";

/*
 * Create a fresh synthetic PL account through the platform's own signup
 * route for first-time-user testing. The generated password is written only
 * to .local/<name>.json (git-ignored, permission-protected) and never printed.
 *
 *   node scripts/create-qa-account.mjs [--name new-user-qa-2]
 */

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const nameIndex = args.indexOf("--name");
const name = nameIndex >= 0 ? args[nameIndex + 1] : "new-user-qa-2";
const API = process.env.PL_API || "http://127.0.0.1:3002";
const ORIGIN = process.env.PL_UI_ORIGIN || "http://127.0.0.1:5174";

const stamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
const account = {
  email: `training-${name}-${stamp}@example.test`,
  password: randomBytes(24).toString("base64url"),
  displayName: `Training New User ${stamp.slice(-6)}`,
  createdAt: new Date().toISOString(),
  purpose: "synthetic first-time-user test identity for the guided training",
};

const response = await fetch(`${API}/api/auth/signup`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: ORIGIN, "idempotency-key": randomUUID() },
  body: JSON.stringify({ email: account.email, password: account.password, passwordConfirmation: account.password, displayName: account.displayName }),
});
const body = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(`signup failed: ${response.status} ${JSON.stringify(body).slice(0, 300)}`);
  process.exit(1);
}
const file = path.join(root, ".local", `${name}.json`);
await fs.writeFile(file, `${JSON.stringify(account, null, 2)}\n`, { flag: "wx" });
console.log(`created ${account.email} (user ${body.user?.userId ?? body.user?.id ?? "?"}); credentials written to ${file}`);
