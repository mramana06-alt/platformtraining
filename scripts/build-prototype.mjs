import fs from "node:fs/promises";
import path from "node:path";
import { PackageSchema } from "../src/schema.mjs";

/*
 * Inline the validated content package into the prototype template so the
 * prototype and the published content never drift. Output is a single,
 * self-contained HTML file that works offline.
 */

const root = path.resolve(import.meta.dirname, "..");
const pkg = PackageSchema.parse(JSON.parse(await fs.readFile(path.join(root, "content", "pl-guide-v2.json"), "utf8")));
const template = await fs.readFile(path.join(root, "prototypes", "pl-guide-v2.template.html"), "utf8");
const marker = "/*__PACKAGE_JSON__*/null";
if (!template.includes(marker)) throw new Error("Template is missing the package marker");
// Escape "</script" so the inlined JSON can never terminate the script element.
const json = JSON.stringify(pkg).replaceAll("</", "<\\/");
const html = template.replace(marker, json).replace("__GENERATED_AT__", new Date().toISOString());
const out = path.join(root, "prototypes", "pl-guide-v2.html");
await fs.writeFile(out, html);
console.log(`Prototype written: ${path.relative(root, out)} (${(html.length / 1024).toFixed(0)} KB, package ${pkg.version}, ${pkg.topics.length} topics)`);
