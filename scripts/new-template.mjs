// Starts a new template and starts the clock.
//   npm run template:new -- WeeklyChallenge "Spin 10 times this week to open a chest" --by "agent name"
// Creates src/templates/<Name>.tsx from a skeleton, lists it in the registry
// (so it shows in the Gallery at once) and opens a run record.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dirtyFiles, loadRuns, root, saveRuns } from "./lib/runs.mjs";

const args = process.argv.slice(2);
const byAt = args.indexOf("--by");
const by = byAt >= 0 ? args.splice(byAt, 2)[1] : "unknown";
const [name, brief] = args;

const fail = (message) => {
  console.error(`template:new failed: ${message}`);
  process.exit(1);
};
if (!name || !brief) fail('usage: npm run template:new -- <PascalCaseName> "<brief>" --by "<who>"');
if (!/^[A-Z][A-Za-z0-9]+$/.test(name)) fail(`"${name}" must be PascalCase, letters and digits only`);

// Snapshot of what was already changed, taken before this script writes anything.
const before = dirtyFiles();

const file = join(root, `src/templates/${name}.tsx`);
if (existsSync(file)) fail(`src/templates/${name}.tsx already exists`);

const title = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^(\w)(.*)$/, (_, a, b) => a + b.toLowerCase());
const text = (s) => JSON.stringify(s);

writeFileSync(
  file,
  `import { TemplateShell } from "./TemplateShell";

// Template: ${title.toLowerCase()}.
// Brief: ${brief.replaceAll("\n", " ")}
// TODO: say here which primitives this uses and the one rule that connects them.
export function ${name}() {
  return (
    <TemplateShell title=${text(title)} intro="TODO: one sentence, what the player does here.">
      <p className="rk-template__hint">TODO: arrange primitives here. See docs/PRIMITIVES.md.</p>
    </TemplateShell>
  );
}
`,
);

const registryPath = join(root, "src/templates/index.ts");
let registry = readFileSync(registryPath, "utf8");
const IMPORTS = "// @templates:imports";
const ENTRIES = "  // @templates:entries";
if (!registry.includes(IMPORTS) || !registry.includes(ENTRIES)) fail("the markers in src/templates/index.ts are missing");
registry = registry
  .replace(IMPORTS, `import { ${name} } from "./${name}";\n${IMPORTS}`)
  .replace(ENTRIES, `  {\n    id: ${text(name)},\n    name: ${text(title)},\n    brief: ${text(brief)},\n    Component: ${name},\n  },\n${ENTRIES}`);
writeFileSync(registryPath, registry);

const runs = loadRuns();
runs.push({ name, brief, by, startedAt: new Date().toISOString(), attempts: [], before });
saveRuns(runs);

console.log(`template:new  src/templates/${name}.tsx created and registered. The clock is running.`);
console.log(`Next: read docs/PRIMITIVES.md, fill in the template, then run: npm run template:verify -- ${name}`);
