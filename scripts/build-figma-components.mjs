// Assembles the Figma component scripts: figma/components/_prelude.js (shared set-up)
// in front of each component file, written to figma/components/run/<Name>.js.
// Each result is one complete use_figma call. Run them after figma/variables.js.
// The scripts rebuild a set from scratch: they remove the set of the same name first.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "figma/components");
const read = (f) => readFileSync(join(dir, f), "utf8").replace(/\r\n/g, "\n");
const prelude = read("_prelude.js");
const names = readdirSync(dir).filter((f) => f.endsWith(".js") && !f.startsWith("_")).sort();

mkdirSync(join(dir, "run"), { recursive: true });
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const written = [];
for (const file of names) {
  const code = `${prelude}\n${read(file)}`;
  // Catch syntax slips here instead of in Figma: the code must compile as an async function body.
  try {
    new AsyncFunction("figma", code);
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    process.exit(1);
  }
  if (code.length > 50000) {
    console.error(`${file}: ${code.length} characters, use_figma accepts at most 50,000`);
    process.exit(1);
  }
  writeFileSync(join(dir, "run", file), code);
  written.push(`${file.replace(".js", "")} (${code.length} chars)`);
}
console.log(`figma components: ${written.join(", ")} -> figma/components/run/`);
