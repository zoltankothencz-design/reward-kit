// The run log: one record per template built with `template:new` and
// `template:verify`. Times and gate attempts are written by the scripts, not
// reported by whoever did the work, so the numbers in docs/AI-RUNS.md are
// measured.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG = join(root, "docs/ai-runs.json");

/** Every file git sees as changed or new, with a hash of its content. */
export function dirtyFiles() {
  const status = spawnSync("git status --porcelain -uall", { cwd: root, shell: true, encoding: "utf8" }).stdout ?? "";
  const out = {};
  for (const line of status.split("\n")) {
    const file = line.slice(3).trim().replace(/^"|"$/g, "");
    if (!file) continue;
    const path = join(root, file);
    out[file] = existsSync(path) && statSync(path).isFile() ? createHash("sha1").update(readFileSync(path)).digest("hex") : "deleted";
  }
  return out;
}

export const loadRuns = () => (existsSync(LOG) ? JSON.parse(readFileSync(LOG, "utf8")) : []);

const cell = (text) => String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const minutes = (seconds) => (seconds === undefined ? "open" : (seconds / 60).toFixed(1));

export function saveRuns(runs) {
  writeFileSync(LOG, JSON.stringify(runs, null, 2) + "\n");

  const lines = [
    "# Template runs",
    "",
    "Generated from `docs/ai-runs.json` by the template scripts. Do not edit by hand.",
    "",
    "Each row is one template built from a brief. The clock starts at `npm run template:new` and stops at the first",
    "`npm run template:verify` that passes every gate, so it includes thinking time. \"Gate attempts\" counts verify runs;",
    "1 means it passed first time. \"Also changed\" lists files touched outside the template itself: an empty cell means the",
    "brief was met by arranging primitives only.",
    "",
    "| Template | Brief | Built by | Minutes | Gate attempts | First failed gate | Also changed | Gaps reported |",
    "|---|---|---|---|---|---|---|---|",
    ...runs.map((r) => {
      const firstFail = r.attempts.find((a) => !a.passed)?.failedGate ?? "";
      return `| ${cell(r.name)} | ${cell(r.brief)} | ${cell(r.by)} | ${minutes(r.seconds)} | ${r.attempts.length} | ${cell(firstFail)} | ${cell((r.alsoChanged ?? []).join(", "))} | ${cell((r.gaps ?? []).join("; "))} |`;
    }),
  ];
  writeFileSync(join(root, "docs/AI-RUNS.md"), lines.join("\n") + "\n");
}
