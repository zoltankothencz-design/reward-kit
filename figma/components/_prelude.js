// Shared set-up for every component script. `npm run figma:components` puts this
// in front of each component file so the result can be run as one use_figma call.
// It finds the variables made by figma/variables.js, loads the brand fonts and
// opens the "Components" page.
const BRANDS = ["Aurum", "Amber", "Frost"];
const colls = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const core = colls.find((c) => c.name === "Core");
const cv = (name) => vars.find((v) => v.variableCollectionId === core.id && v.name === name);
const bcoll = (brand) => colls.find((c) => c.name === "Brand / " + brand);
const bv = (brand, name) => vars.find((v) => v.variableCollectionId === bcoll(brand).id && v.name === name);

const avail = await figma.listAvailableFontsAsync();
const pick = (family, wanted) => {
  const styles = avail.filter((f) => f.fontName.family === family).map((f) => f.fontName.style);
  return wanted.find((w) => styles.includes(w)) ?? styles[0];
};
const fonts = {};
for (const b of BRANDS) {
  const mode = bcoll(b).modes[0].modeId;
  const display = bv(b, "font/display").valuesByMode[mode];
  const body = bv(b, "font/body").valuesByMode[mode];
  fonts[b] = {
    display: { family: display, style: pick(display, ["Bold", "Regular"]) },
    strong: { family: body, style: pick(body, ["SemiBold", "Semi Bold", "Bold", "Regular"]) },
    body: { family: body, style: pick(body, ["Regular"]) },
  };
  for (const kind of ["display", "strong", "body"]) await figma.loadFontAsync(fonts[b][kind]);
}

// A solid paint bound to a colour variable.
const paint = (variable) => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", variable);
const corners = ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"];
const bindAll = (node, names, variable) => names.forEach((n) => node.setBoundVariable(n, variable));
const padding = (node, tokens) => {
  const [top, right, bottom, left] = tokens;
  node.setBoundVariable("paddingTop", cv("space/" + top));
  node.setBoundVariable("paddingRight", cv("space/" + right));
  node.setBoundVariable("paddingBottom", cv("space/" + bottom));
  node.setBoundVariable("paddingLeft", cv("space/" + left));
};

// A text node with its font family, size and colour bound to variables.
function label(brand, chars, kind, sizeToken, colorVariable, name) {
  const t = figma.createText();
  t.name = name;
  t.fontName = fonts[brand][kind];
  t.characters = chars;
  try {
    t.setBoundVariable("fontFamily", bv(brand, kind === "display" ? "font/display" : "font/body"));
  } catch (error) {
    /* the fill and size are still bound */
  }
  t.setBoundVariable("fontSize", cv("font-size/" + sizeToken));
  t.fills = [paint(colorVariable)];
  return t;
}

// The page, and a place under what is already on it. A rebuild removes the old set of the same name first.
let page = figma.root.children.find((p) => p.name === "Components");
if (!page) {
  page = figma.createPage();
  page.name = "Components";
}
await figma.setCurrentPageAsync(page);
const removeSet = (name) => page.children.filter((n) => n.name === name).forEach((n) => n.remove());
const nextY = () => page.children.reduce((m, c) => Math.max(m, c.y + c.height), -120) + 120;
// Variant names look like "Brand=Aurum, Tier=mini": read them back into an object.
const parts = (variant) => Object.fromEntries(variant.name.split(", ").map((kv) => kv.split("=")));
