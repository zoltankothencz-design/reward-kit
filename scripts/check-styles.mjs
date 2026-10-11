// Style guard. Components and templates must read colours and fonts from
// tokens, never hard-code them; that is what makes a new brand work with no
// component changes. Templates also may not define motion of their own.
//   npm run check
import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = (dir) =>
  readdirSync(join(root, dir)).map((f) => join(dir, f)).filter((f) => [".css", ".tsx"].includes(extname(f)));

const problems = [];
const scan = (file, rules) => {
  const lines = readFileSync(join(root, file), "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.trim().startsWith("/*") || line.trim().startsWith("*") || line.trim().startsWith("//")) return;
    for (const [name, pattern] of rules) {
      const hit = line.match(pattern);
      if (hit) problems.push(`${file}:${i + 1}  ${name}: ${hit[0]}`);
    }
  });
};

const everywhere = [
  // white is allowed: highlights and sparkles are white in every brand
  ["hard-coded colour", /#(?!fff\b|ffffff\b)[0-9a-fA-F]{3,8}\b/],
  ["hard-coded colour", /\brgba?\(/],
  ["hard-coded font", /font-family\s*:\s*(?=[^\s;v])[^;]+/],
];
// Durations must come from motion tokens, so the motion spec stays true.
const componentCssOnly = [["hard-coded duration", /(?<![\w-])\d*\.?\d+m?s\b/]];
const templateOnly = [
  ["motion in a template", /\banimation\s*:|\btransition\s*:|@keyframes/],
];

for (const f of [...files("src/components"), ...files("src/templates")]) scan(f, everywhere);
for (const f of files("src/components").filter((f) => f.endsWith(".css"))) scan(f, componentCssOnly);
for (const f of files("src/templates")) scan(f, templateOnly);

if (problems.length) {
  console.error(`Style check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("styles: no hard-coded colours, fonts or durations, no motion in templates");
