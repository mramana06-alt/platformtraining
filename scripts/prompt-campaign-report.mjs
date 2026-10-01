import fs from "node:fs/promises";
import path from "node:path";

/*
 * Turn a prompt-campaign results directory into report.md and report.html.
 *   node scripts/prompt-campaign-report.mjs <dir>
 */

const dir = path.resolve(process.argv[2] || ".");
const lines = (await fs.readFile(path.join(dir, "results.jsonl"), "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
let topicsLive = null;
try {
  topicsLive = JSON.parse(await fs.readFile(path.join(dir, "topics-live.json"), "utf8"));
} catch {}
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const count = (pred) => lines.filter(pred).length;
const verdicts = ["pass", "partial", "asked", "boundary", "misrouted", "fail"];
const byVerdict = Object.fromEntries(verdicts.map((v) => [v, count((r) => r.verdict === v)]));
const durations = lines.map((r) => r.durationMs).sort((a, b) => a - b);
const median = durations.length ? Math.round(durations[Math.floor(durations.length / 2)] / 1000) : 0;
const p90 = durations.length ? Math.round(durations[Math.floor(durations.length * 0.9)] / 1000) : 0;
const capabilities = {};
for (const r of lines) capabilities[r.capability || "unknown"] = (capabilities[r.capability || "unknown"] || 0) + 1;
const direct = lines.filter((r) => r.kind === "direct"), recommended = lines.filter((r) => r.kind === "recommended");
const findings = lines.filter((r) => r.verdict !== "pass");
const generatedAt = new Date().toISOString();

const md = [];
md.push(`# Prompt campaign report`, ``, `Generated ${generatedAt}. Source: \`${dir}\`.`, ``);
md.push(`| Metric | Value |`, `|---|---|`, `| Cases run | ${lines.length} (direct ${direct.length}, recommended ${recommended.length}) |`, `| Pass | ${byVerdict.pass} |`, `| Partial (generic answer) | ${byVerdict.partial} |`, `| Asked a question instead | ${byVerdict.asked} |`, `| Correct boundary (no application in project) | ${byVerdict.boundary} |`, `| Misrouted to application overview | ${byVerdict.misrouted} |`, `| Fail | ${byVerdict.fail} |`, `| Median / p90 seconds per prompt | ${median} / ${p90} |`, `| Capabilities that answered | ${Object.entries(capabilities).map(([k, v]) => `${k} (${v})`).join(", ")} |`);
if (topicsLive) md.push(`| Guide topics through the live adapter | ${topicsLive.rows.filter((r) => !r.problems.length).length} of ${topicsLive.rows.length} ok, package ${topicsLive.package} |`);
md.push(``, `## Findings (non-pass cases)`, ``);
if (!findings.length) md.push(`None.`);
for (const r of findings) md.push(`- **${r.verdict}** · ${r.id} · ${Math.round(r.durationMs / 1000)}s · status ${r.status}${r.error ? ` · error: ${r.error.slice(0, 160)}` : ""}${r.pending ? ` · PL asked: "${r.pending.prompt.slice(0, 160)}"` : ""}`);
md.push(``, `## All cases`, ``, `| # | Kind | Prompt | Verdict | s | Capability | Key terms | Answer excerpt |`, `|---|---|---|---|---|---|---|---|`);
lines.forEach((r, i) => md.push(`| ${i + 1} | ${r.kind} | ${r.prompt.replace(/\|/g, "\\|").slice(0, 90)} | ${r.verdict} | ${Math.round(r.durationMs / 1000)} | ${r.capability || ""} | ${(r.termHits || []).concat(r.globalHits || []).slice(0, 5).join(", ")} | ${(r.answer || r.error || (r.pending ? "asked: " + r.pending.prompt : "")).replace(/\s+/g, " ").replace(/\|/g, "\\|").slice(0, 140)} |`));
await fs.writeFile(path.join(dir, "report.md"), md.join("\n") + "\n");

const tile = (v, l) => `<div class="tile"><b>${esc(v)}</b><span>${esc(l)}</span></div>`;
const row = (r, i) => `<tr class="v-${r.verdict}"><td>${i + 1}</td><td>${r.kind}</td><td class="p">${esc(r.prompt)}</td><td><span class="badge ${r.verdict}">${r.verdict}</span></td><td class="n">${Math.round(r.durationMs / 1000)}</td><td>${esc(r.capability || "")}</td><td class="t">${esc((r.termHits || []).concat(r.globalHits || []).slice(0, 6).join(", "))}</td><td class="a"><details><summary>${esc((r.answer || r.error || (r.pending ? "PL asked: " + r.pending.prompt : "")).replace(/\s+/g, " ").slice(0, 160))}</summary><pre>${esc(r.answer || r.error || JSON.stringify(r.pending, null, 1))}</pre></details></td></tr>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Prompt Campaign Report</title>
<style>
body{margin:0;background:#f9f9f7;color:#25292c;font:14px/1.55 Aptos,"Segoe UI",system-ui,sans-serif}main{max-width:1180px;margin:0 auto;padding:28px 22px 60px}
h1{font:500 1.7rem/1.2 Georgia,serif;margin:0 0 4px}.meta{color:#52675a;font-size:.82rem;margin-bottom:16px}
.band{background:linear-gradient(135deg,#244f3b,#2f6a50);color:#fff;border-radius:12px;padding:16px 20px;margin-bottom:14px}.band h1{color:#fff}.band .meta{color:#cfe0d5}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0 18px}.tile{background:#fff;border:1px solid #dfe5e1;border-radius:10px;padding:12px}.tile b{display:block;font-size:1.5rem;color:#244f3b}.tile span{color:#52675a;font-size:.78rem}
h2{font:600 1.1rem/1.3 Georgia,serif;color:#244f3b;border-bottom:2px solid #edf3ef;padding-bottom:4px;margin:22px 0 10px}
table{border-collapse:collapse;width:100%;font-size:.82rem;background:#fff}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e3e8e4;vertical-align:top}th{background:#244f3b;color:#fff;font-size:.74rem}
td.p{max-width:320px}td.a{max-width:420px}td.n{text-align:right}td.t{color:#52675a;font-size:.76rem}
.badge{display:inline-block;padding:1px 8px;border-radius:999px;font-size:.72rem;font-weight:700;color:#fff}.badge.pass{background:#2e8b57}.badge.partial{background:#b77a1b}.badge.asked{background:#2a78d6}.badge.boundary{background:#52675a}.badge.misrouted{background:#8a4b9a}.badge.fail{background:#b42318}
details summary{cursor:pointer}pre{white-space:pre-wrap;font:12px/1.45 ui-monospace,Consolas,monospace;background:#fbfcfb;border:1px solid #e3e8e4;border-radius:8px;padding:8px;max-height:420px;overflow:auto}
ul.findings li{margin:4px 0}.wrap{overflow-x:auto}
</style></head><body><main>
<div class="band"><h1>Prompt campaign: every guide question and recommended prompt sent to PL LOOP</h1><div class="meta">Generated ${esc(generatedAt)} · account: fresh synthetic PL user created for this run · PL API ${esc(lines[0]?.projectId ? "127.0.0.1:3002" : "")}</div></div>
<div class="tiles">${tile(lines.length, "cases sent to PL")}${tile(byVerdict.pass, "pass")}${tile(byVerdict.partial, "partial (generic)")}${tile(byVerdict.asked, "asked a question instead")}${tile(byVerdict.boundary, "correct boundary")}${tile(byVerdict.misrouted, "misrouted by PL")}${tile(byVerdict.fail, "fail")}${tile(`${median}s / ${p90}s`, "median / p90 per prompt")}${topicsLive ? tile(`${topicsLive.rows.filter((r) => !r.problems.length).length}/${topicsLive.rows.length}`, `guide topics ok (package ${esc(topicsLive.package)})`) : ""}</div>
<h2>How to read this</h2><p><b>Pass</b>: PL answered with substance. <b>Partial</b>: PL answered but said it lacked platform specifics (generic answer). <b>Asked</b>: PL asked a clarifying question instead of answering; expected for discovery-style prompts. <b>Correct boundary</b>: the prompt referred to the current application and the project had none, so PL refused with a typed result. <b>Misrouted</b>: a general platform question was routed to the application-overview capability and refused; a PL routing finding. <b>Fail</b>: error, timeout or no answer. Capabilities: ${esc(Object.entries(capabilities).map(([k, v]) => `${k} (${v})`).join(", "))}.</p>
<h2>Findings (non-pass cases)</h2>${findings.length ? `<ul class="findings">${findings.map((r) => `<li><span class="badge ${r.verdict}">${r.verdict}</span> ${esc(r.id)} · ${Math.round(r.durationMs / 1000)}s · status ${esc(r.status)}${r.error ? ` · error: ${esc(r.error.slice(0, 200))}` : ""}${r.pending ? ` · PL asked: “${esc(r.pending.prompt.slice(0, 200))}”` : ""}</li>`).join("")}</ul>` : "<p>None.</p>"}
<h2>All cases</h2><div class="wrap"><table><thead><tr><th>#</th><th>Kind</th><th>Prompt</th><th>Verdict</th><th>s</th><th>Capability</th><th>Key terms found</th><th>PL answer (expand)</th></tr></thead><tbody>${lines.map(row).join("")}</tbody></table></div>
</main></body></html>`;
await fs.writeFile(path.join(dir, "report.html"), html);
console.log(`report: ${lines.length} cases; pass ${byVerdict.pass}, partial ${byVerdict.partial}, asked ${byVerdict.asked}, fail ${byVerdict.fail}; median ${median}s p90 ${p90}s → ${path.join(dir, "report.html")}`);
