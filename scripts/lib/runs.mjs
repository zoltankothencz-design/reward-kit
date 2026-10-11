// The run log: one record per template started with `template:new`. Times and
// gate attempts are written by the scripts, not reported by whoever did the
// work, so the numbers in docs/AI-RUNS.md are measured.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG = join(root, "docs/ai-runs.json");

/** Every file that differs from the last commit, or is new. */
export function changedFiles() {
  const status = spawnSync("git status --porcelain -uall", { cwd: root, shell: true, encoding: "utf8" }).stdout ?? "";
  return status
    .split("\n")
    .map((line) => line.slice(3).trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

export const loadRuns = () => (existsSync(LOG) ? JSON.parse(readFileSync(LOG, "utf8")) : []);

/** The newest run for a template name, or exit with a message. */
export function findRun(runs, name, command) {
  const run = runs.findLast((r) => r.name === name);
  if (!run) {
    console.error(`${command} failed: no run for "${name}". Start one with npm run template:new.`);
    process.exit(1);
  }
  return run;
}

/** Removes a template's import and entry from the registry text. */
export function unregister(registry, name) {
  return registry
    .replace(/\r\n/g, "\n")
    .replace(`import { ${name} } from "./${name}";\n`, "")
    .replace(new RegExp(`  \\{\\n    id: "${name}",[\\s\\S]*?Component: ${name},\\n  \\},\\n`), "");
}

const cell = (text) => String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const outcome = (r) => (r.abandonedAt ? "stopped, gap reported" : r.seconds === undefined ? "open" : `${(r.seconds / 60).toFixed(1)} min`);

export function saveRuns(runs) {
  writeFileSync(LOG, JSON.stringify(runs, null, 2) + "\n");

  const lines = [
    "# Template runs",
    "",
    "Generated from `docs/ai-runs.json` by the template scripts. Do not edit by hand.",
    "",
    "Each row is one template started from a brief.",
    "",
    "- **Result**: minutes from `npm run template:new` to the first `npm run template:verify` that passed every gate, or",
    "  \"stopped, gap reported\" when the builder found the primitives could not serve the brief and said so.",
    "- **Gate attempts**: how many times verify ran. 1 means it passed first time.",
    "- **Also changed**: files changed besides the template and its registry entry. Empty means the brief was met by",
    "  arranging primitives only.",
    "- **Owner review**: what a person found when looking at the result in the browser. The gates cannot see layout,",
    "  so this column is where their blind spots show.",
    "",
    "| Template | Brief | Built by | Result | Gate attempts | First failed gate | Also changed | Gaps reported | Owner review |",
    "|---|---|---|---|---|---|---|---|---|",
    ...runs.map((r) => {
      const firstFail = r.attempts.find((a) => !a.passed)?.failedGate ?? "";
      return `| ${[r.name, r.brief, r.by, outcome(r), r.attempts.length, firstFail, (r.alsoChanged ?? []).join(", "), (r.gaps ?? []).join("; "), (r.review ?? []).join(" ")].map(cell).join(" | ")} |`;
    }),
  ];
  writeFileSync(join(root, "docs/AI-RUNS.md"), lines.join("\n") + "\n");
}
