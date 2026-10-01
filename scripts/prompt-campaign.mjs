import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/*
 * Prompt campaign: send every guide question and every recommended prompt to
 * the live PL API as the training QA user and record what PL answers.
 *
 *   node scripts/prompt-campaign.mjs [--out <dir>] [--workers 3] [--per-project 8] [--only direct|recommended] [--limit N]
 *
 * Credentials are read from .local/new-user-qa.json and never printed.
 * Results: <out>/results.jsonl (one line per case), <out>/summary.json.
 */

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const root = path.resolve(import.meta.dirname, "..");
const OUT = path.resolve(opt("out", path.join(root, "evaluations", `prompt-campaign-${new Date().toISOString().slice(0, 10)}`)));
const WORKERS = Number(opt("workers", 3));
const PER_PROJECT = Number(opt("per-project", 8));
const ONLY = opt("only", "");
const LIMIT = Number(opt("limit", 0));
const API = process.env.PL_API || "http://127.0.0.1:3002";
const ORIGIN = process.env.PL_UI_ORIGIN || "http://127.0.0.1:5174";
const SETTLE_TIMEOUT_MS = 6 * 60_000;

const pkg = JSON.parse(await fs.readFile(path.join(root, "content", "pl-guide-v2.json"), "utf8"));
const creds = JSON.parse(await fs.readFile(process.env.TRAINING_QA_CREDS || path.join(root, ".local", "new-user-qa.json"), "utf8"));

/** The product owner's question list (topic ids whose prompt is the question verbatim) plus the later additions. */
const DIRECT_TOPICS = [
  "platform-purpose", "primary-use", "what-can-i-do", "getting-started", "build-an-app", "typical-process", "idea-to-app", "major-stages",
  "components", "components-together", "where-development", "where-deployed", "where-run", "environments", "config-infra-runtime",
  "enhance-deployed", "existing-app", "change-handling", "automation-vs-approval", "roles", "correctness", "quality-checks", "readiness",
  "errors", "simple-effort", "moderate-approach", "complex-approach", "complexity-factors", "examples-by-size", "process-by-size",
  "end-to-end", "business-idea-journey", "artifacts-per-stage", "decisions-approvals", "context-knowledge", "production-improvement",
  "six-months-later", "lifecycle-flow", "architecture-diagram", "how-it-all-works",
  "who-is-it-for", "dev-process-diagram", "delivery-swimlane", "application-lifecycle", "runtime-architecture", "local-dev-architecture", "what-is-eal-note",
];
const GLOBAL_TERMS = ["platform loops", " pl ", "eal", "blueprint", "requirements", "business review", "local development", "ume", "ekg", "start build", "solution design", "build plan", "release", "capabilit"];

const byId = new Map(pkg.topics.map((t) => [t.id, t]));
const cases = [];
for (const id of DIRECT_TOPICS) {
  const t = byId.get(id);
  if (!t) throw new Error(`missing topic ${id}`);
  cases.push({ id: `direct:${id}`, kind: "direct", topicId: id, prompt: t.prompt, terms: t.keywords.map((k) => k.toLowerCase()) });
}
const seen = new Set();
for (const t of pkg.topics) {
  for (const p of t.plPrompts) {
    if (seen.has(p.prompt)) continue;
    seen.add(p.prompt);
    cases.push({ id: `recommended:${t.id}:${p.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`, kind: "recommended", topicId: t.id, label: p.label, prompt: p.prompt, requires: p.requires, terms: t.keywords.map((k) => k.toLowerCase()) });
  }
}
let selected = ONLY ? cases.filter((c) => c.kind === ONLY) : cases;
if (LIMIT) selected = selected.slice(0, LIMIT);

await fs.mkdir(OUT, { recursive: true });
const resultsFile = path.join(OUT, "results.jsonl");
const done = new Set();
try {
  for (const line of (await fs.readFile(resultsFile, "utf8")).split("\n")) if (line.trim()) done.add(JSON.parse(line).id);
} catch {}
const todo = selected.filter((c) => !done.has(c.id));
console.log(`cases: ${selected.length} selected, ${done.size} already recorded, ${todo.length} to run, workers ${WORKERS}, out ${OUT}`);

let cookie = "";
async function call(method, p, body) {
  const response = await fetch(API + p, {
    method,
    headers: { "content-type": "application/json", origin: ORIGIN, "idempotency-key": randomUUID(), ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(`${method} ${p} -> ${response.status} ${JSON.stringify(json).slice(0, 300)}`), { status: response.status, body: json });
  return json;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getSession = (id) => call("GET", `/api/sessions/${id}`);
async function settle(sessionId) {
  const started = Date.now();
  for (;;) {
    const s = await getSession(sessionId);
    if (["waiting_for_user", "completed", "failed", "blocked", "paused", "cancelled"].includes(s.status)) return s;
    if (Date.now() - started > SETTLE_TIMEOUT_MS) return { ...s, timedOut: true };
    await sleep(3000);
  }
}

/** Pull the answer text out of the last result, whatever capability produced it. */
function extractAnswer(session) {
  const results = session.results || [];
  const last = results[results.length - 1];
  if (!last) return { text: "", blocks: 0, capability: null, raw: null };
  const blocks = [];
  const walk = (o, depth = 0) => {
    if (!o || typeof o !== "object" || depth > 10) return;
    if (Array.isArray(o)) return o.forEach((x) => walk(x, depth + 1));
    if (Array.isArray(o.blocks) && o.blocks.every((b) => b && typeof b === "object" && typeof b.type === "string")) blocks.push(...o.blocks);
    for (const v of Object.values(o)) if (v && typeof v === "object") walk(v, depth + 1);
  };
  walk(last);
  const blockText = (b) => b.text || b.code || b.mermaid || b.source || (Array.isArray(b.items) ? b.items.map((i) => (typeof i === "string" ? i : i.text || i.label || "")).join(" ") : "") || (Array.isArray(b.rows) ? b.rows.map((r) => (Array.isArray(r) ? r.join(" | ") : JSON.stringify(r))).join("\n") : "") || b.title || b.label || "";
  // The answer object carries the full text; blocks are its typed presentation (paragraphs, tables, diagrams).
  const text = typeof last.text === "string" && last.text.trim() ? last.text : blocks.map(blockText).filter(Boolean).join("\n");
  const diagrams = blocks.filter((b) => b.type === "diagram").length;
  const capability = last.capabilityId || last.capability?.id || last.kind || (last.type === "answer" ? "general-answer" : last.type) || null;
  return { text, blocks: blocks.length, diagrams, capability, raw: JSON.stringify(last).slice(0, 20_000) };
}

const ABOUT_CURRENT_APP = /\b(this|the current|returning to this) application\b|current application|the current app\b/i;

export function score(c, answer, session) {
  const last = (session.results || []).at(-1);
  if (last?.type === "application_overview_unavailable") {
    return { verdict: ABOUT_CURRENT_APP.test(c.prompt) ? "boundary" : "misrouted", termHits: [], globalHits: [], generic: false, boundaryReason: last.reason || null };
  }
  const text = ` ${answer.text.toLowerCase()} `;
  const termHits = c.terms.filter((t) => text.includes(t));
  const globalHits = GLOBAL_TERMS.filter((t) => text.includes(t.toLowerCase()));
  const generic = /not provided|not supplied|were not (provided|supplied)|no information|cannot determine|do not have access|don't have access|unable to access|not available in (the|this) (current )?context|exact platform name|representative because/.test(text);
  const isQuestion = answer.text.trim().endsWith("?") && answer.text.length < 400;
  let verdict;
  if (session.status === "failed" || session.timedOut) verdict = "fail";
  else if (session.pendingInteraction && !answer.text) verdict = "asked";
  else if (isQuestion) verdict = "asked";
  else if (!answer.text || answer.text.length < 120) verdict = "fail";
  else if (generic) verdict = "partial";
  else verdict = "pass";
  return { verdict, termHits, globalHits, generic };
}

async function login() {
  await call("POST", "/api/auth/login", { email: creds.email, password: creds.password });
}

async function worker(index, batch) {
  let project = null, sessionId = null, used = 0;
  for (const c of batch) {
    if (!project || used >= PER_PROJECT) {
      const created = await call("POST", "/api/projects", { expectedVersion: 0, name: `Training prompt validation ${new Date().toISOString().slice(0, 10)} w${index} ${randomUUID().slice(0, 4)}` });
      project = created.project;
      sessionId = created.session.sessionId;
      used = 0;
    }
    const started = Date.now();
    let record;
    try {
      const before = await getSession(sessionId);
      await call("POST", `/api/sessions/${sessionId}/messages`, { expectedVersion: before.sessionVersion, text: c.prompt });
      await sleep(1500);
      const s = await settle(sessionId);
      const answer = extractAnswer(s);
      const sc = score(c, answer, s);
      record = {
        id: c.id, kind: c.kind, topicId: c.topicId, label: c.label, prompt: c.prompt, projectId: project.projectId ?? project.id, sessionId,
        status: s.status, timedOut: Boolean(s.timedOut), durationMs: Date.now() - started, capability: answer.capability, blocks: answer.blocks,
        answerChars: answer.text.length, answer: answer.text.slice(0, 4000), pending: s.pendingInteraction ? { type: s.pendingInteraction.type, prompt: String(s.pendingInteraction.prompt || "").slice(0, 300), options: (s.pendingInteraction.options || []).map((o) => o.label ?? o.title).slice(0, 6) } : null,
        ...sc, recordedAt: new Date().toISOString(),
      };
      await fs.writeFile(path.join(OUT, "raw", `${c.id.replace(/[^a-z0-9]+/gi, "_")}.json`), answer.raw || "null");
      // A pending interaction blocks further messages in this session: answer discovery prompts start a new session next.
      if (s.pendingInteraction || s.status === "failed" || s.status === "blocked") used = PER_PROJECT;
      else used += 1;
    } catch (error) {
      record = { id: c.id, kind: c.kind, topicId: c.topicId, prompt: c.prompt, projectId: project?.projectId ?? project?.id, sessionId, status: "error", error: String(error.message).slice(0, 500), durationMs: Date.now() - started, verdict: "fail", recordedAt: new Date().toISOString() };
      used = PER_PROJECT;
    }
    await fs.appendFile(resultsFile, `${JSON.stringify(record)}\n`);
    console.log(`[w${index}] ${record.verdict.padEnd(7)} ${Math.round(record.durationMs / 1000)}s ${record.status} ${c.id}${record.error ? " :: " + record.error.slice(0, 120) : ""}`);
  }
}

await fs.mkdir(path.join(OUT, "raw"), { recursive: true });
await login();
const batches = Array.from({ length: WORKERS }, () => []);
todo.forEach((c, i) => batches[i % WORKERS].push(c));
await Promise.all(batches.map((b, i) => worker(i + 1, b)));

const lines = (await fs.readFile(resultsFile, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
const byVerdict = {};
for (const r of lines) byVerdict[r.verdict] = (byVerdict[r.verdict] || 0) + 1;
const summary = { recordedAt: new Date().toISOString(), api: API, cases: lines.length, byVerdict, byKind: { direct: lines.filter((r) => r.kind === "direct").length, recommended: lines.filter((r) => r.kind === "recommended").length }, medianSeconds: (() => { const d = lines.map((r) => r.durationMs).sort((a, b) => a - b); return d.length ? Math.round(d[Math.floor(d.length / 2)] / 1000) : 0; })(), out: OUT };
await fs.writeFile(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary));
