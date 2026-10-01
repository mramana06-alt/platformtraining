import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/*
 * Guide-path check against the live PL adapter: sign in as the training QA
 * user, load the experience, then load every topic through
 * /api/training/topics/:id and verify the contract the player relies on.
 */

const root = path.resolve(import.meta.dirname, "..");
const API = process.env.PL_API || "http://127.0.0.1:3002";
const ORIGIN = process.env.PL_UI_ORIGIN || "http://127.0.0.1:5174";
const creds = JSON.parse(await fs.readFile(process.env.TRAINING_QA_CREDS || path.join(root, ".local", "new-user-qa.json"), "utf8"));
let cookie = "";
async function call(method, p, body) {
  const response = await fetch(API + p, { method, headers: { "content-type": "application/json", origin: ORIGIN, "idempotency-key": randomUUID(), ...(cookie ? { cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  return { status: response.status, json: await response.json().catch(() => ({})) };
}
await call("POST", "/api/auth/login", { email: creds.email, password: creds.password });
const exp = await call("GET", "/api/training/experience");
if (exp.status !== 200) throw new Error(`experience ${exp.status}`);
const e = exp.json;
console.log(`package ${e.packageVersion}: ${e.topics.length} topics, ${e.tracks.length} tracks, installed capabilities ${e.capabilities.installed.length}, suggestions ${e.suggestions.length}`);
const rows = [];
for (const t of e.topics) {
  const r = await call("GET", `/api/training/topics/${t.id}`);
  const v = r.json;
  const diagrams = r.status === 200 ? v.topic.blocks.filter((b) => b.type === "diagram") : [];
  const clickable = diagrams.reduce((n, d) => n + ((d.steps || d.sequence || []).filter((s) => s.detail).length), 0);
  const problems = [];
  if (r.status !== 200) problems.push(`status ${r.status}`);
  else {
    if (!diagrams.length) problems.push("no diagram");
    if (!v.followUps.length) problems.push("no follow-ups");
    if (v.followUps.some((f) => !f.title)) problems.push("unresolved follow-up");
    if (!Array.isArray(v.topic.takeaways)) problems.push("no takeaways array");
    if (v.plPrompts.some((p) => p.available && p.requires.some((c) => !e.capabilities.installed.some((i) => i.id === c)))) problems.push("availability mismatch");
  }
  rows.push({ id: t.id, level: t.level, track: t.track, status: r.status, diagrams: diagrams.length, clickable, followUps: r.status === 200 ? v.followUps.length : 0, prompts: r.status === 200 ? v.plPrompts.length : 0, available: r.status === 200 ? v.plPrompts.filter((p) => p.available).length : 0, takeaways: r.status === 200 ? v.topic.takeaways.length : 0, problems });
}
const bad = rows.filter((r) => r.problems.length);
console.log(`topics ok: ${rows.length - bad.length}/${rows.length}; diagrams ${rows.reduce((n, r) => n + r.diagrams, 0)}; clickable steps ${rows.reduce((n, r) => n + r.clickable, 0)}; recommended prompts ${rows.reduce((n, r) => n + r.prompts, 0)} (${rows.reduce((n, r) => n + r.available, 0)} available here)`);
for (const r of bad) console.log(`PROBLEM ${r.id}: ${r.problems.join(", ")}`);
const outDir = process.argv[2];
if (outDir) {
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "topics-live.json"), JSON.stringify({ checkedAt: new Date().toISOString(), package: e.packageVersion, installed: e.capabilities.installed.map((c) => c.id), rows }, null, 2));
}
