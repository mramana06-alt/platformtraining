import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PackageSchema, normalizeLearnerPayload } from "../src/schema.mjs";

const raw = JSON.parse(await fs.readFile(new URL("../content/pl-guide-v2.json", import.meta.url), "utf8"));
const pkg = PackageSchema.parse(raw);

test("published package is schema 2 with tracks, four levels and diagram-bearing topics", () => {
  assert.equal(pkg.schemaVersion, 2);
  assert.ok(pkg.tracks.length >= 4);
  assert.equal(pkg.levels.length, 4);
  assert.ok(pkg.topics.length >= 30, `expected at least 30 topics, got ${pkg.topics.length}`);
  for (const t of pkg.topics) assert.ok(t.blocks.some((b) => b.type === "diagram"), `${t.id} has a diagram`);
});

test("every level and track is reachable from the starters within four clicks", () => {
  const byId = new Map(pkg.topics.map((t) => [t.id, t]));
  const seen = new Map(pkg.entry.starters.map((s) => [s, 0]));
  const queue = [...pkg.entry.starters];
  while (queue.length) {
    const id = queue.shift();
    const depth = seen.get(id);
    for (const f of byId.get(id).followUps) {
      if (!seen.has(f)) {
        seen.set(f, depth + 1);
        queue.push(f);
      }
    }
  }
  const unreachable = pkg.topics.filter((t) => !seen.has(t.id)).map((t) => t.id);
  assert.deepEqual(unreachable, [], "all topics reachable from starters");
  const tooDeep = [...seen].filter(([, d]) => d > 4).map(([id]) => id);
  assert.deepEqual(tooDeep, [], "no topic deeper than four clicks");
});

test("content cannot carry markup, scripts or unknown fields", () => {
  assert.throws(() => PackageSchema.parse({ ...raw, script: "alert(1)" }));
  const withMarkup = structuredClone(raw);
  withMarkup.topics[0].summary = "see <b>this</b>";
  assert.throws(() => PackageSchema.parse(withMarkup));
  const danglingFollowUp = structuredClone(raw);
  danglingFollowUp.topics[0].followUps = ["not-a-topic"];
  assert.throws(() => PackageSchema.parse(danglingFollowUp));
  const noDiagram = structuredClone(raw);
  noDiagram.topics[0].blocks = [{ type: "paragraph", text: "prose only" }];
  assert.throws(() => PackageSchema.parse(noDiagram));
});

test("v1 learner rows are upgraded without losing the guidance mode", () => {
  assert.deepEqual(normalizeLearnerPayload({ mode: "direct", attempt: { id: "x" } }), { schema: 2, mode: "direct", visited: {}, lastTopic: null });
  assert.deepEqual(normalizeLearnerPayload(null), { schema: 2, mode: "guided", visited: {}, lastTopic: null });
  const v2 = { schema: 2, mode: "guided", visited: { "what-is-pl": "2026-09-13T00:00:00.000Z" }, lastTopic: "what-is-pl" };
  assert.deepEqual(normalizeLearnerPayload(v2), v2);
});
