import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadConfig } from "../src/config.mjs";
import { AUDIENCE } from "../src/auth.mjs";
import { createRepository } from "../src/repository.mjs";

/*
 * Runs against the owned platformtraining database with the restricted
 * runtime role. Uses unique synthetic tenants so real progress is untouched.
 */

test("owned database isolates learners by tenant and user and keeps progress idempotent", async () => {
  const config = await loadConfig();
  const repo = await createRepository(config.databaseUrl, { channel: config.channel });
  const ctx = { tenantId: `test-training-${randomUUID()}`, userId: randomUUID(), capabilities: ["outcome-discovery"], stage: "welcome", exp: 0, aud: AUDIENCE };
  const otherUser = { ...ctx, userId: randomUUID() };
  const otherTenant = { ...ctx, tenantId: `test-training-${randomUUID()}` };
  try {
    const initial = await repo.experience(ctx);
    assert.equal(initial.learner.version, 0);
    const first = initial.entry.starters[0];

    const visit = { eventId: randomUUID(), expectedVersion: 0, action: "visit", topicId: first };
    const [a, b] = await Promise.all([repo.act(ctx, visit), repo.act(ctx, visit)]);
    assert.equal(a.learner.version, 1);
    assert.equal(b.learner.version, 1, "duplicate concurrent event resolves to one write");
    assert.equal(a.progress.visited, 1);

    assert.equal((await repo.experience(otherUser)).learner.version, 0, "another user sees nothing");
    assert.equal((await repo.experience(otherTenant)).learner.version, 0, "another tenant sees nothing");

    await assert.rejects(repo.act(ctx, { ...visit, action: "reset" }), /different input/);
    await assert.rejects(repo.act(ctx, { eventId: randomUUID(), expectedVersion: 0, action: "reset" }), /changed/);

    const topic = await repo.topic(ctx, first);
    assert.equal(topic.topic.id, first);
    assert.equal(topic.learner.payload.lastTopic, first);
    await assert.rejects(repo.topic(ctx, "no-such-topic"), /Unknown topic/);

    const rows = (await repo.pool.query("select * from training.learners")).rows;
    assert.equal(rows.length, 0, "RLS denies unscoped reads");
    await assert.rejects(repo.pool.query("update training.channels set version = version"), /permission denied/);
  } finally {
    await repo.pool.end();
  }
});
