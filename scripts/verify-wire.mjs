import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadConfig } from "../src/config.mjs";
import { AUDIENCE, signRequest } from "../src/auth.mjs";

/*
 * End-to-end check against the running service on loopback. Uses a unique
 * synthetic tenant and user so real learner progress is never touched.
 */

const config = await loadConfig();
const base = `http://127.0.0.1:${config.port}`;
const identity = {
  tenantId: `wire-test-${randomUUID()}`,
  userId: randomUUID(),
  capabilities: ["outcome-discovery", "general-answer"],
  stage: "outcome-discovery",
  aud: AUDIENCE,
};

async function call(path, body) {
  const method = body ? "POST" : "GET";
  const raw = body ? JSON.stringify(body) : "";
  const context = { ...identity, exp: Math.floor(Date.now() / 1000) + 45 };
  const headers = { "content-type": "application/json", ...signRequest({ method, path, raw, context, secret: config.signingSecret }) };
  const response = await fetch(base + path, { method, headers, ...(body ? { body: raw } : {}) });
  return { status: response.status, data: await response.json() };
}

const health = await fetch(`${base}/health`).then((r) => r.json());
assert.equal(health.playerVersion, 2, "service must run the v2 player contract");
assert.equal((await fetch(`${base}/v1/experience`)).status, 401, "unsigned requests are refused");

const experience = await call("/v1/experience");
assert.equal(experience.status, 200);
assert.equal(experience.data.schemaVersion, 2);
assert.ok(experience.data.topics.length >= 8, "topic index present");
assert.ok(experience.data.suggestions.length > 0, "stage suggestions present");
assert.equal(experience.data.progress.visited, 0);

const first = experience.data.entry.starters[0];
const topic = await call(`/v1/topics/${first}`);
assert.equal(topic.status, 200);
assert.ok(topic.data.topic.blocks.some((b) => b.type === "diagram"), "topic renders a diagram");
assert.ok(topic.data.followUps.length > 0, "topic offers follow-ups");
assert.equal((await call("/v1/topics/does-not-exist")).status, 404);

const visit = { eventId: randomUUID(), expectedVersion: 0, action: "visit", topicId: first };
const a = await call("/v1/progress", visit);
assert.equal(a.status, 200);
assert.equal(a.data.progress.visited, 1);
const replay = await call("/v1/progress", visit);
assert.equal(replay.data.learner.version, a.data.learner.version, "same event id replays the same result");
const stale = await call("/v1/progress", { eventId: randomUUID(), expectedVersion: 0, action: "visit", topicId: first });
assert.equal(stale.status, 409, "stale expectedVersion is rejected");
const mode = await call("/v1/progress", { eventId: randomUUID(), expectedVersion: a.data.learner.version, action: "mode", mode: "direct" });
assert.equal(mode.data.learner.payload.mode, "direct");
const reset = await call("/v1/progress", { eventId: randomUUID(), expectedVersion: mode.data.learner.version, action: "reset" });
assert.equal(reset.data.progress.visited, 0);

console.log(`Wire check passed against ${base}: package ${experience.data.packageVersion}, ${experience.data.topics.length} topics`);
