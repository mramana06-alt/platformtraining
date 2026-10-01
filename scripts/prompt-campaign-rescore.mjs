import fs from "node:fs/promises";
import path from "node:path";

/*
 * Re-score a finished campaign from its raw PL results without re-running the
 * prompts. Keeps a copy of the original results as results.original.jsonl.
 *   node scripts/prompt-campaign-rescore.mjs <dir>
 */

const dir = path.resolve(process.argv[2] || ".");
const GLOBAL_TERMS = ["platform loops", " pl ", "eal", "blueprint", "requirements", "business review", "local development", "ume", "ekg", "start build", "solution design", "build plan", "release", "capabilit"];
const lines = (await fs.readFile(path.join(dir, "results.jsonl"), "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
try {
  await fs.writeFile(path.join(dir, "results.original.jsonl"), lines.map((r) => JSON.stringify(r)).join("\n") + "\n", { flag: "wx" });
} catch {}

function extract(raw) {
  if (!raw) return { text: "", blocks: 0, diagrams: 0, capability: null };
  const blocks = [];
  const walk = (o, depth = 0) => {
    if (!o || typeof o !== "object" || depth > 10) return;
    if (Array.isArray(o)) return o.forEach((x) => walk(x, depth + 1));
    if (Array.isArray(o.blocks) && o.blocks.every((b) => b && typeof b === "object" && typeof b.type === "string")) blocks.push(...o.blocks);
    for (const v of Object.values(o)) if (v && typeof v === "object") walk(v, depth + 1);
  };
  walk(raw);
  const blockText = (b) => b.text || b.code || b.mermaid || b.source || (Array.isArray(b.items) ? b.items.map((i) => (typeof i === "string" ? i : i.text || i.label || "")).join(" ") : "") || (Array.isArray(b.rows) ? b.rows.map((r) => (Array.isArray(r) ? r.join(" | ") : JSON.stringify(r))).join("\n") : "") || b.title || b.label || "";
  const text = typeof raw.text === "string" && raw.text.trim() ? raw.text : blocks.map(blockText).filter(Boolean).join("\n");
  return { text, blocks: blocks.length, diagrams: blocks.filter((b) => b.type === "diagram").length, capability: raw.capabilityId || raw.capability?.id || raw.kind || (raw.type === "answer" ? "general-answer" : raw.type) || null };
}

const ABOUT_CURRENT_APP = /\b(this|the current|returning to this) application\b|current application|the current app\b/i;

function score(r, answer, raw) {
  if (raw?.type === "application_overview_unavailable") {
    // PL routed the prompt to the application-overview capability and found no application in the project.
    const verdict = ABOUT_CURRENT_APP.test(r.prompt) ? "boundary" : "misrouted";
    return { verdict, termHits: [], globalHits: [], generic: false, boundaryReason: raw.reason || null };
  }
  const text = ` ${answer.text.toLowerCase()} `;
  const termHits = (r.termHits || []).length ? r.termHits : [];
  const globalHits = GLOBAL_TERMS.filter((t) => text.includes(t.toLowerCase()));
  const generic = /not provided|not supplied|were not (provided|supplied)|no information|cannot determine|do not have access|don't have access|unable to access|not available in (the|this) (current )?context|exact platform name|representative because/.test(text);
  const isQuestion = answer.text.trim().endsWith("?") && answer.text.length < 400;
  let verdict;
  if (r.status === "failed" || r.timedOut || r.status === "error") verdict = "fail";
  else if (r.pending && !answer.text) verdict = "asked";
  else if (isQuestion) verdict = "asked";
  else if (!answer.text || answer.text.length < 120) verdict = "fail";
  else if (generic) verdict = "partial";
  else verdict = "pass";
  return { verdict, termHits, globalHits, generic };
}

const out = [];
for (const r of lines) {
  let raw = null;
  try {
    raw = JSON.parse(await fs.readFile(path.join(dir, "raw", `${r.id.replace(/[^a-z0-9]+/gi, "_")}.json`), "utf8"));
  } catch {}
  const answer = raw ? extract(raw) : { text: r.answer || "", blocks: r.blocks || 0, diagrams: 0, capability: r.capability };
  const sc = score(r, answer, raw);
  out.push({ ...r, capability: answer.capability, blocks: answer.blocks, diagrams: answer.diagrams, answerChars: answer.text.length, answer: answer.text.slice(0, 4000), ...sc, rescoredAt: new Date().toISOString() });
}
await fs.writeFile(path.join(dir, "results.jsonl"), out.map((r) => JSON.stringify(r)).join("\n") + "\n");
const tally = {};
for (const r of out) tally[r.verdict] = (tally[r.verdict] || 0) + 1;
console.log(`rescored ${out.length} cases:`, JSON.stringify(tally), `generic answers: ${out.filter((r) => r.generic).length}`);
