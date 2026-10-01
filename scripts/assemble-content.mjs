import fs from "node:fs/promises";
import path from "node:path";
import { PackageSchema } from "../src/schema.mjs";

/*
 * Merge `content/v2/package.json` with every `content/v2/topics.*.json`
 * (one file per track, in track order) into the single validated package
 * `content/pl-guide-v2.json` that the publisher, tests and prototype use.
 */

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "content", "v2");
const base = JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8"));
const files = (await fs.readdir(dir)).filter((f) => /^topics\..+\.json$/.test(f));
const byTrack = new Map();
for (const file of files) {
  const topics = JSON.parse(await fs.readFile(path.join(dir, file), "utf8"));
  for (const topic of topics) {
    if (!byTrack.has(topic.track)) byTrack.set(topic.track, []);
    byTrack.get(topic.track).push(topic);
  }
}
const topics = base.tracks.flatMap((track) => byTrack.get(track.id) || []);
const unknownTracks = [...byTrack.keys()].filter((t) => !base.tracks.some((track) => track.id === t));
if (unknownTracks.length) throw new Error(`Topics reference unknown tracks: ${unknownTracks.join(", ")}`);

const pkg = PackageSchema.parse({ ...base, topics });
const out = path.join(root, "content", "pl-guide-v2.json");
await fs.writeFile(out, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`Assembled ${pkg.version}: ${pkg.topics.length} topics in ${pkg.tracks.length} tracks → ${path.relative(root, out)}`);
