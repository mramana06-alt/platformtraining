import { z } from "zod";

/*
 * Content package schema, version 2.
 *
 * Content is data only: bounded text, typed blocks and typed diagram
 * descriptions. It can never carry markup, scripts, selectors or commands,
 * so a published package cannot change what the player is allowed to do.
 */

const noMarkup = (value) => !/[<>]/.test(value);
const text = (max) => z.string().min(1).max(max).refine(noMarkup, "Markup is not allowed in content");
export const short = text(160);
export const medium = text(700);
export const long = text(2500);

export const id = z.string().regex(/^[a-z][a-z0-9-]{1,60}$/, "Identifiers are lowercase words joined by hyphens");
export const capabilityId = z.string().regex(/^[a-z][a-z0-9-]{1,80}$/);

export const DIAGRAM_KINDS = ["flow", "swimlane", "layers", "map", "wireframe", "timeline"];

const DiagramBlock = z
  .object({
    type: z.literal("diagram"),
    kind: z.enum(DIAGRAM_KINDS),
    caption: short.optional(),
    // flow (a step with `detail` opens a details popup when clicked)
    steps: z.array(z.object({ label: short, note: short.optional(), detail: medium.optional(), artifact: short.optional() }).strict()).min(2).max(8).optional(),
    highlight: z.number().int().min(0).max(7).optional(),
    // swimlane (a box with `detail` opens a details popup when clicked)
    lanes: z.array(short).min(2).max(5).optional(),
    sequence: z
      .array(z.object({ lane: z.number().int().min(0).max(4), label: short, detail: medium.optional(), artifact: short.optional() }).strict())
      .min(2)
      .max(14)
      .optional(),
    // layers
    layers: z.array(z.object({ title: short, items: z.array(short).min(1).max(6) }).strict()).min(2).max(6).optional(),
    // map
    center: short.optional(),
    nodes: z.array(z.object({ label: short, note: short.optional(), topic: id.optional() }).strict()).min(3).max(10).optional(),
    // wireframe
    view: z.enum(["worklist", "form", "overview"]).optional(),
    title: short.optional(),
    columns: z.array(short).min(2).max(6).optional(),
    fields: z.array(short).min(2).max(8).optional(),
    primary: short.optional(),
    // timeline
    items: z
      .array(z.object({ label: short, detail: medium.optional(), state: z.enum(["done", "active", "todo"]).optional() }).strict())
      .min(2)
      .max(8)
      .optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    const need = (field) => {
      if (d[field] === undefined) ctx.addIssue({ code: "custom", message: `${d.kind} diagram requires ${field}` });
    };
    if (d.kind === "flow") need("steps");
    if (d.kind === "swimlane") {
      need("lanes");
      need("sequence");
      if (d.lanes && d.sequence && d.sequence.some((s) => s.lane >= d.lanes.length)) {
        ctx.addIssue({ code: "custom", message: "swimlane sequence refers to a missing lane" });
      }
    }
    if (d.kind === "layers") need("layers");
    if (d.kind === "map") {
      need("center");
      need("nodes");
    }
    if (d.kind === "wireframe") {
      need("view");
      need("title");
    }
    if (d.kind === "timeline") need("items");
  });

export const BlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: long }).strict(),
  z.object({ type: z.literal("heading"), text: short }).strict(),
  z.object({ type: z.literal("bullets"), items: z.array(text(300)).min(1).max(10) }).strict(),
  z.object({ type: z.literal("numbered"), items: z.array(text(300)).min(1).max(10) }).strict(),
  z.object({ type: z.literal("key_value"), rows: z.array(z.object({ label: short, value: medium }).strict()).min(1).max(12) }).strict(),
  z
    .object({ type: z.literal("table"), columns: z.array(short).min(2).max(6), rows: z.array(z.array(text(220)).min(2).max(6)).min(1).max(14) })
    .strict(),
  z
    .object({ type: z.literal("callout"), tone: z.enum(["info", "tip", "warning", "success"]), title: short.optional(), text: medium })
    .strict(),
  z.object({ type: z.literal("steps"), items: z.array(z.object({ title: short, detail: medium }).strict()).min(2).max(12) }).strict(),
  z.object({ type: z.literal("example"), title: short, before: medium, after: medium, features: z.array(short).min(1).max(8) }).strict(),
  /** Replaced by the service with the workspace's installed capabilities. */
  z.object({ type: z.literal("installed_capabilities"), intro: medium }).strict(),
  DiagramBlock,
]);

export const PlPromptSchema = z
  .object({
    label: short,
    prompt: long,
    requires: z.array(capabilityId).max(8).default([]),
    stages: z.array(z.string().max(80)).max(12).default([]),
  })
  .strict();

export const TopicSchema = z
  .object({
    id,
    track: id,
    level: z.number().int().min(0).max(3),
    title: short,
    /** The question the learner is "asking" when they open this topic. */
    prompt: text(260),
    summary: medium,
    /** Two to four one-line takeaways shown as an executive summary above the body. */
    takeaways: z.array(text(200)).max(4).default([]),
    /** How much of the answer reflects the platform today. */
    status: z.enum(["available", "partial", "planned"]).optional(),
    statusNote: short.optional(),
    blocks: z.array(BlockSchema).min(1).max(16),
    followUps: z.array(id).max(6).default([]),
    plPrompts: z.array(PlPromptSchema).max(4).default([]),
    keywords: z.array(short).max(12).default([]),
  })
  .strict();

export const PackageSchema = z
  .object({
    schemaVersion: z.literal(2),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    playerVersion: z.literal(2),
    entry: z
      .object({ title: short, body: medium, starters: z.array(id).min(2).max(4), composerHint: short })
      .strict(),
    tracks: z.array(z.object({ id, title: short, summary: medium }).strict()).min(2).max(8),
    levels: z.array(z.object({ id: z.number().int().min(0).max(3), title: short }).strict()).length(4),
    capabilities: z.array(z.object({ id: capabilityId, title: short, summary: medium }).strict()).max(40).default([]),
    topics: z.array(TopicSchema).min(8).max(120),
  })
  .strict()
  .superRefine((pkg, ctx) => {
    const topicIds = new Set();
    for (const t of pkg.topics) {
      if (topicIds.has(t.id)) ctx.addIssue({ code: "custom", message: `Duplicate topic id ${t.id}` });
      topicIds.add(t.id);
    }
    const trackIds = new Set(pkg.tracks.map((t) => t.id));
    if (trackIds.size !== pkg.tracks.length) ctx.addIssue({ code: "custom", message: "Duplicate track ids" });
    for (const s of pkg.entry.starters) {
      if (!topicIds.has(s)) ctx.addIssue({ code: "custom", message: `Starter ${s} is not a topic` });
    }
    for (const t of pkg.topics) {
      if (!trackIds.has(t.track)) ctx.addIssue({ code: "custom", message: `Topic ${t.id} uses unknown track ${t.track}` });
      if (!t.blocks.some((b) => b.type === "diagram")) ctx.addIssue({ code: "custom", message: `Topic ${t.id} has no diagram` });
      for (const f of t.followUps) {
        if (f === t.id) ctx.addIssue({ code: "custom", message: `Topic ${t.id} follows up to itself` });
        if (!topicIds.has(f)) ctx.addIssue({ code: "custom", message: `Topic ${t.id} follows up to unknown ${f}` });
      }
      for (const b of t.blocks) {
        if (b.type === "diagram" && b.kind === "map") {
          for (const n of b.nodes) if (n.topic && !topicIds.has(n.topic)) ctx.addIssue({ code: "custom", message: `Map in ${t.id} links unknown topic ${n.topic}` });
        }
      }
    }
  });

/** Learner progress payload, version 2. */
export const LearnerPayloadSchema = z
  .object({
    schema: z.literal(2),
    mode: z.enum(["guided", "direct"]),
    visited: z.record(id, z.string()),
    lastTopic: id.nullable(),
  })
  .strict();

export const ActionSchema = z
  .object({
    eventId: z.uuid(),
    expectedVersion: z.number().int().min(0),
    action: z.enum(["visit", "mode", "reset"]),
    topicId: id.optional(),
    mode: z.enum(["guided", "direct"]).optional(),
  })
  .strict();

export const EMPTY_LEARNER = Object.freeze({ schema: 2, mode: "guided", visited: {}, lastTopic: null });

/** Accept a v1 learner row (`{mode, attempt}`) and any v2 row; always return a v2 payload. */
export function normalizeLearnerPayload(payload) {
  if (payload && payload.schema === 2) return LearnerPayloadSchema.parse(payload);
  return { ...EMPTY_LEARNER, mode: payload?.mode === "direct" ? "direct" : "guided", visited: {} };
}
