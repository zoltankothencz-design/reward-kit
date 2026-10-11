// Style and structure guard.
//   npm run check
// Components and templates must read colours and fonts from tokens, never
// hard-code them; that is what makes a new brand work with no component
// changes. Component durations must be motion tokens, so the motion spec stays
// true. Templates are held to more: they only arrange primitives.
import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");
const files = (dir, exts = [".css", ".tsx"]) =>
  readdirSync(join(root, dir)).map((f) => join(dir, f).replaceAll("\\", "/")).filter((f) => exts.includes(extname(f)));

const problems = [];
const scan = (file, rules) => {
  let inBlockComment = false;
  read(file).split("\n").forEach((line, i) => {
    const text = line.trim();
    if (inBlockComment) {
      if (text.includes("*/")) inBlockComment = false;
      return;
    }
    if (text.startsWith("/*") && !text.includes("*/")) {
      inBlockComment = true;
      return;
    }
    if (text.startsWith("/*") || text.startsWith("//") || text.startsWith("{/*")) return;
    for (const [name, pattern] of rules) {
      const hit = line.match(pattern);
      if (hit) problems.push(`${file}:${i + 1}  ${name}: ${hit[0].trim()}`);
    }
  });
};

const everywhere = [
  // white is allowed: highlights and sparkles are white in every brand
  ["hard-coded colour", /#(?!fff\b|ffffff\b)[0-9a-fA-F]{3,8}\b/],
  ["hard-coded colour", /\b(rgba?|hsla?|oklch|oklab)\(/],
  ["hard-coded font", /font-family\s*:\s*(?=[^\s;v])[^;]+/],
];
const componentCss = [["hard-coded duration", /(?<![\w-])\d*\.?\d+m?s\b/]];

// A template arranges primitives. Anything below means it started to build
// something of its own, which belongs in a primitive instead.
const templateCode = [
  ["motion in a template", /\banimation\s*:|\btransition\s*:|@keyframes/],
  ["inline style in a template", /\bstyle=\{/],
  ["drawing in a template", /<(svg|canvas)\b/],
  ["timer in a template (sequencing belongs in a primitive or a helper)", /\b(setTimeout|setInterval|requestAnimationFrame)\s*\(/],
];
const ALLOWED_TEMPLATE_IMPORTS = [/^react$/, /^\.\.\/components\/[A-Z]\w+$/, /^\.\.\/lib\/\w+$/, /^\.\/TemplateShell$/, /^\.\/templates\.css$/];
const TEMPLATE_INFRA = ["TemplateShell.tsx"];

for (const f of [...files("src/components"), ...files("src/templates")]) scan(f, everywhere);
for (const f of files("src/components", [".css"])) scan(f, componentCss);
for (const f of files("src/templates")) scan(f, templateCode);

const registry = read("src/templates/index.ts");
for (const f of files("src/templates", [".tsx"])) {
  if (TEMPLATE_INFRA.includes(basename(f))) continue;
  const name = basename(f, ".tsx");
  for (const [, source] of read(f).matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm)) {
    if (!ALLOWED_TEMPLATE_IMPORTS.some((ok) => ok.test(source)))
      problems.push(`${f}  import not allowed in a template: "${source}" (allowed: react, ../components/*, ../lib/*, ./TemplateShell)`);
  }
  if (!new RegExp(`import \\{ ${name} \\} from "\\./${name}";`).test(registry) || !new RegExp(`Component: ${name}\\b`).test(registry))
    problems.push(`${f}  template is not listed in src/templates/index.ts`);
}
for (const f of files("src/templates", [".css"])) {
  if (basename(f) !== "templates.css") problems.push(`${f}  templates share templates.css; a template may not bring its own stylesheet`);
}

if (problems.length) {
  console.error(`Style check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("styles: tokens only in components and templates; templates only arrange primitives and are all registered");
