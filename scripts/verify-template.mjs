// Runs every build gate for a template and records the attempt.
//   npm run template:verify -- WeeklyChallenge
//   npm run template:verify -- WeeklyChallenge --gap "No layout helper puts two primitives side by side"
// The first passing run stops the clock. --gap adds a note about something
// the primitives could not do; use it when you still delivered a template.
// If you could not deliver one at all, use template:abandon instead.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { changedFiles, findRun, loadRuns, root, saveRuns } from "./lib/runs.mjs";

const args = process.argv.slice(2);
const gapAt = args.indexOf("--gap");
const gap = gapAt >= 0 ? args.splice(gapAt, 2)[1] : null;
const [name] = args;

const runs = loadRuns();
const run = findRun(runs, name, "template:verify");
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

let failedGate = null;
let output = "";
if (readFileSync(join(root, `src/templates/${name}.tsx`), "utf8").includes("TODO")) {
  failedGate = "unfinished";
  output = "The template still contains TODO. Fill it in, then verify again.";
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

// What differs from the last commit besides the template and its registry
// entry? template:new only starts on a clean tree, so this is everything done
// for this brief. An empty list means it was met by arranging primitives only.
const expected = [`src/templates/${name}.tsx`, "src/templates/index.ts", "docs/"];
run.alsoChanged = changedFiles().filter((file) => !expected.some((e) => file.startsWith(e)));

const passed = failedGate === null;
run.attempts.push({ at: new Date().toISOString(), passed, ...(passed ? {} : { failedGate }) });
if (passed && !run.finishedAt) {
  run.finishedAt = new Date().toISOString();
  run.seconds = Math.round((Date.parse(run.finishedAt) - Date.parse(run.startedAt)) / 1000);
}
saveRuns(runs);

if (!passed) {
  console.error(`\ntemplate:verify  FAILED at gate "${failedGate}" (attempt ${run.attempts.length})\n\n${output}`);
  process.exit(1);
}
console.log(`\ntemplate:verify  passed on attempt ${run.attempts.length}, ${(run.seconds / 60).toFixed(1)} minutes after template:new.`);
if (run.alsoChanged.length) console.log(`Also changed outside the template: ${run.alsoChanged.join(", ")}`);
console.log("Recorded in docs/AI-RUNS.md.");
