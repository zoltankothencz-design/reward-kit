// Stops a run because the primitives cannot serve the brief.
//   npm run template:abandon -- DailyPrizeWheel --gap "No primitive draws or rotates a segmented wheel"
// Removes the unfinished template and its registry entry, so nothing half-done
// shows in the Gallery, and closes the run with the gap on record. Stopping
// with a clear gap is a valid result: it tells the owner what to build next.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findRun, loadRuns, root, saveRuns, unregister } from "./lib/runs.mjs";

const args = process.argv.slice(2);
const gapAt = args.indexOf("--gap");
const gap = gapAt >= 0 ? args.splice(gapAt, 2)[1] : null;
const [name] = args;

const runs = loadRuns();
const run = findRun(runs, name, "template:abandon");
if (gap) run.gaps = [...(run.gaps ?? []), gap];
if (!run.gaps?.length) {
  console.error('template:abandon failed: say what is missing with --gap "<one sentence naming the missing capability>"');
  process.exit(1);
}
if (run.finishedAt) {
  console.error(`template:abandon failed: "${name}" already passed verify. Delete it by hand if it should go.`);
  process.exit(1);
}

const file = join(root, `src/templates/${name}.tsx`);
if (existsSync(file)) rmSync(file);
const registryPath = join(root, "src/templates/index.ts");
writeFileSync(registryPath, unregister(readFileSync(registryPath, "utf8"), name));

run.abandonedAt = new Date().toISOString();
saveRuns(runs);
console.log(`template:abandon  "${name}" removed. Gap on record: ${run.gaps.join("; ")}`);
