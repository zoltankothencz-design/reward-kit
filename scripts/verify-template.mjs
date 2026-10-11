// Runs every build gate for a template and records the attempt.
//   npm run template:verify -- WeeklyChallenge
//   npm run template:verify -- WeeklyChallenge --gap "No primitive shows a countdown outside an offer"
// The first passing run stops the clock. --gap adds a note to the run about
// something the primitives could not do; it can be repeated on later runs.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { dirtyFiles, loadRuns, root, saveRuns } from "./lib/runs.mjs";

const args = process.argv.slice(2);
const gapAt = args.indexOf("--gap");
const gap = gapAt >= 0 ? args.splice(gapAt, 2)[1] : null;
const [name] = args;

const runs = loadRuns();
const run = runs.findLast((r) => r.name === name);
if (!run) {
  console.error(`template:verify failed: no open run for "${name}". Start one with npm run template:new.`);
  process.exit(1);
}
if (gap) run.gaps = [...(run.gaps ?? []), gap];

// The same gates as `npm run build`, one at a time so the failing one is named.
const GATES = [
  ["tokens", "npm run --silent tokens"],
  ["check", "npm run --silent check"],
  ["catalog", "npm run --silent catalog"],
  ["spec", "npm run --silent spec"],
  ["test", "npm run --silent test"],
  ["types", "npx tsc --noEmit"],
  ["bundle", "npx vite build --logLevel error"],
];

const problems = [];
const source = readFileSync(join(root, `src/templates/${name}.tsx`), "utf8");
if (source.includes("TODO")) problems.push("the template still contains TODO");

let failedGate = null;
let output = "";
if (problems.length) {
  failedGate = "todo";
  output = problems.join("\n");
} else {
  for (const [gate, command] of GATES) {
    const result = spawnSync(command, { cwd: root, shell: true, encoding: "utf8" });
    if (result.status !== 0) {
      failedGate = gate;
      output = `${result.stdout}\n${result.stderr}`.trim();
      break;
    }
    console.log(`  ok  ${gate}`);
  }
}

// What changed since template:new, besides the template and its registry
// entry? An empty list means the brief was met by arranging primitives only.
const expected = [`src/templates/${name}.tsx`, "src/templates/index.ts", "docs/"];
const before = run.before ?? {};
run.alsoChanged = Object.entries(dirtyFiles())
  .filter(([file, hash]) => before[file] !== hash && !expected.some((e) => file.startsWith(e)))
  .map(([file]) => file);

const passed = failedGate === null;
run.attempts.push({ at: new Date().toISOString(), passed, ...(passed ? {} : { failedGate }) });
if (passed && !run.finishedAt) {
  run.finishedAt = new Date().toISOString();
  run.seconds = Math.round((Date.parse(run.finishedAt) - Date.parse(run.startedAt)) / 1000);
  delete run.before; // only needed while the run is open
}
saveRuns(runs);

if (!passed) {
  console.error(`\ntemplate:verify  FAILED at gate "${failedGate}" (attempt ${run.attempts.length})\n\n${output}`);
  process.exit(1);
}
console.log(`\ntemplate:verify  passed on attempt ${run.attempts.length}, ${(run.seconds / 60).toFixed(1)} minutes after template:new.`);
if (run.alsoChanged.length) console.log(`Also changed outside the template: ${run.alsoChanged.join(", ")}`);
console.log("Recorded in docs/AI-RUNS.md.");
