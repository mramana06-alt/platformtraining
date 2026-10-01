import { HttpError } from "./auth.mjs";
import { normalizeLearnerPayload } from "./schema.mjs";

/*
 * Pure functions that turn a package, a request context and a learner row
 * into the views the player renders. No I/O here, so every rule is testable.
 */

const promptAvailable = (prompt, context) => prompt.requires.every((cap) => context.capabilities.includes(cap));

/** Rank prompts for the learner's current PL stage; only prompts whose capabilities are installed. */
export function selectSuggestions(pkg, context, limit = 3) {
  const seen = new Set();
  const all = [];
  for (const topic of pkg.topics) {
    for (const prompt of topic.plPrompts) {
      if (!promptAvailable(prompt, context) || seen.has(prompt.label)) continue;
      seen.add(prompt.label);
      all.push({ topicId: topic.id, label: prompt.label, prompt: prompt.prompt, stageMatch: prompt.stages.includes(context.stage) ? 1 : 0, level: topic.level });
    }
  }
  return all
    .sort((a, b) => b.stageMatch - a.stageMatch || a.level - b.level)
    .slice(0, limit)
    .map(({ stageMatch, level, ...rest }) => rest);
}

function installedCapabilities(pkg, context) {
  const described = new Map(pkg.capabilities.map((c) => [c.id, c]));
  const installed = context.capabilities.map((cid) => described.get(cid) || { id: cid, title: cid.replaceAll("-", " "), summary: "Installed in this workspace." });
  const missing = pkg.capabilities.filter((c) => !context.capabilities.includes(c.id));
  return { installed, missing };
}

const indexEntry = (topic, visited) => ({
  id: topic.id,
  track: topic.track,
  level: topic.level,
  title: topic.title,
  prompt: topic.prompt,
  summary: topic.summary,
  visited: Boolean(visited[topic.id]),
});

/** The entry view: orientation, tracks with progress, topic index, suggestions and learner state. */
export function buildExperience(pkg, context, learner) {
  const payload = normalizeLearnerPayload(learner.payload);
  const visitedCount = pkg.topics.filter((t) => payload.visited[t.id]).length;
  return {
    schemaVersion: 2,
    packageVersion: pkg.version,
    entry: pkg.entry,
    levels: pkg.levels,
    tracks: pkg.tracks.map((track) => {
      const topics = pkg.topics.filter((t) => t.track === track.id);
      return { ...track, total: topics.length, visited: topics.filter((t) => payload.visited[t.id]).length };
    }),
    capabilities: installedCapabilities(pkg, context),
    topics: pkg.topics.map((t) => indexEntry(t, payload.visited)),
    suggestions: selectSuggestions(pkg, context),
    progress: { visited: visitedCount, total: pkg.topics.length },
    learner: { version: learner.version, payload },
  };
}

/** One topic with its blocks resolved, follow-ups classified and PL prompts marked available or not. */
export function buildTopicView(pkg, context, learner, topicId) {
  const topic = pkg.topics.find((t) => t.id === topicId);
  if (!topic) throw new HttpError("Unknown topic", 404);
  const payload = normalizeLearnerPayload(learner.payload);
  const caps = installedCapabilities(pkg, context);
  const blocks = topic.blocks.map((block) =>
    block.type === "installed_capabilities" ? { ...block, installed: caps.installed, missing: caps.missing } : block,
  );
  const followUps = topic.followUps
    .map((fid) => pkg.topics.find((t) => t.id === fid))
    .filter(Boolean)
    .map((f) => ({
      ...indexEntry(f, payload.visited),
      relation: f.level > topic.level ? "deeper" : f.level < topic.level ? "up" : "related",
    }));
  const plPrompts = topic.plPrompts.map((p) => ({
    label: p.label,
    prompt: p.prompt,
    requires: p.requires,
    available: promptAvailable(p, context),
    stageMatch: p.stages.includes(context.stage),
  }));
  return {
    schemaVersion: 2,
    packageVersion: pkg.version,
    topic: {
      id: topic.id,
      track: topic.track,
      level: topic.level,
      title: topic.title,
      prompt: topic.prompt,
      summary: topic.summary,
      takeaways: topic.takeaways,
      ...(topic.status ? { status: topic.status } : {}),
      ...(topic.statusNote ? { statusNote: topic.statusNote } : {}),
      blocks,
      keywords: topic.keywords,
    },
    followUps,
    plPrompts,
    learner: { version: learner.version, payload },
  };
}

/** Apply one progress action to a learner row and return the next row. Throws HttpError on invalid input. */
export function reduceProgress(learner, action, pkg, now = new Date()) {
  const payload = structuredClone(normalizeLearnerPayload(learner.payload));
  if (action.action === "mode") {
    if (!action.mode) throw new HttpError("Choose a guidance mode", 400);
    payload.mode = action.mode;
  } else if (action.action === "visit") {
    if (!action.topicId || !pkg.topics.some((t) => t.id === action.topicId)) throw new HttpError("Unknown topic", 400);
    payload.visited[action.topicId] = now.toISOString();
    payload.lastTopic = action.topicId;
  } else if (action.action === "reset") {
    payload.visited = {};
    payload.lastTopic = null;
  }
  return { version: learner.version + 1, payload };
}
