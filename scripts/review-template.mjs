// Adds the owner's review note to a run, after looking at the result in the browser.
//   npm run template:review -- ComebackBonus "Chest and offer stacked, not side by side. Fixed with rk-template__pair."
// The gates cannot see layout. This note is where what they missed is kept.
import { findRun, loadRuns, saveRuns } from "./lib/runs.mjs";

const [name, note] = process.argv.slice(2);
if (!name || !note) {
  console.error('usage: npm run template:review -- <Name> "<what you found>"');
  process.exit(1);
}
const runs = loadRuns();
const run = findRun(runs, name, "template:review");
run.review = [...(run.review ?? []), note];
saveRuns(runs);
console.log(`template:review  note added to "${name}".`);
