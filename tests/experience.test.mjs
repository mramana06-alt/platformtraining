import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PackageSchema } from "../src/schema.mjs";
import { buildExperience, buildTopicView, reduceProgress, selectSuggestions } from "../src/experience.mjs";
import { AUDIENCE, signRequest, verifyRequest } from "../src/auth.mjs";

const pkg = PackageSchema.parse(JSON.parse(await fs.readFile(new URL("../content/pl-guide-v2.json", import.meta.url), "utf8")));
const context = (over = {}) => ({ tenantId: "t", userId: randomUUID(), capabilities: ["outcome-discovery", "general-answer"], stage: "welcome", exp: 0, aud: AUDIENCE, ...over });
const fresh = { version: 0, payload: { mode: "guided", attempt: null } };

test("experience reports tracks, progress and stage-ranked suggestions limited to installed capabilities", () => {
  const view = buildExperience(pkg, context(), fresh);
  assert.equal(view.schemaVersion, 2);
  assert.equal(view.tracks.length, pkg.tracks.length);
  assert.equal(view.progress.visited, 0);
  assert.ok(view.suggestions.length <= 3 && view.suggestions.length > 0);
  const none = buildExperience(pkg, context({ capabilities: [] }), fresh);
  for (const s of none.suggestions) {
    const topic = pkg.topics.find((t) => t.id === s.topicId);
    assert.deepEqual(topic.plPrompts.find((p) => p.label === s.label).requires, []);
  }
  const discovery = selectSuggestions(pkg, context({ stage: "outcome-discovery" }));
  assert.ok(discovery.length > 0);
});

test("topic view resolves follow-ups with relations and marks unavailable PL prompts", () => {
  const view = buildTopicView(pkg, context({ capabilities: [] }), fresh, "platform-purpose");
  assert.equal(view.topic.id, "platform-purpose");
  assert.ok(Array.isArray(view.topic.takeaways) && view.topic.takeaways.length > 0, "topic view carries takeaways");
  assert.equal(view.topic.status, "available");
  const swimlane = buildTopicView(pkg, context(), fresh, "delivery-swimlane");
  const diagram = swimlane.topic.blocks.find((b) => b.type === "diagram" && b.kind === "swimlane");
  assert.ok(diagram && diagram.sequence.every((s) => s.detail), "swimlane steps carry details for the popup");
  assert.ok(view.followUps.every((f) => ["deeper", "related", "up"].includes(f.relation)));
  assert.ok(view.followUps.some((f) => f.relation === "deeper"), "overview offers deeper follow-ups");
  for (const p of view.plPrompts) if (p.requires.length) assert.equal(p.available, false);
  assert.throws(() => buildTopicView(pkg, context(), fresh, "missing-topic"), /Unknown topic/);
});

test("installed capabilities block is resolved from the request context, never from content", () => {
  const view = buildTopicView(pkg, context({ capabilities: ["full-stack-builder", "made-up-capability"] }), fresh, "capabilities-installed");
  const block = view.topic.blocks.find((b) => b.type === "installed_capabilities");
  assert.ok(block);
  assert.deepEqual(
    block.installed.map((c) => c.id),
    ["full-stack-builder", "made-up-capability"],
  );
  assert.ok(block.missing.every((c) => !["full-stack-builder", "made-up-capability"].includes(c.id)));
});

test("progress reducer records visits, last topic, mode and reset with optimistic versions", () => {
  let learner = fresh;
  learner = reduceProgress(learner, { action: "visit", topicId: "platform-purpose" }, pkg);
  assert.equal(learner.version, 1);
  assert.equal(learner.payload.lastTopic, "platform-purpose");
  learner = reduceProgress(learner, { action: "mode", mode: "direct" }, pkg);
  assert.equal(learner.payload.mode, "direct");
  assert.throws(() => reduceProgress(learner, { action: "visit", topicId: "nope" }, pkg), /Unknown topic/);
  learner = reduceProgress(learner, { action: "reset" }, pkg);
  assert.deepEqual(learner.payload.visited, {});
  assert.equal(learner.payload.mode, "direct", "reset keeps the guidance mode");
});

test("request authority is bound to method, path, body and expiry", () => {
  const secret = "s".repeat(48);
  const now = Date.now();
  const ctx = { ...context(), exp: Math.floor(now / 1000) + 30 };
  const raw = JSON.stringify({ action: "reset" });
  const headers = signRequest({ method: "POST", path: "/v1/progress", raw, context: ctx, secret });
  const req = { method: "POST", url: "/v1/progress", headers };
  assert.equal(verifyRequest(req, raw, secret, now).tenantId, "t");
  assert.throws(() => verifyRequest(req, '{"action":"visit"}', secret, now), /Unauthorized/);
  assert.throws(() => verifyRequest({ ...req, url: "/v1/experience" }, raw, secret, now), /Unauthorized/);
  assert.throws(() => verifyRequest(req, raw, secret, now + 100_000), /Expired/);
  assert.throws(() => verifyRequest(req, raw, "wrong".repeat(10), now), /Unauthorized/);
});
