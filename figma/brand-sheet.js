// Draws one specimen frame per brand on the "Brand sheet" page, with every
// fill, radius, font and size bound to the variables that variables.js made.
// Run it after variables.js. Safe to run again: it replaces its own frames.
// Works with either layout: one "Brand" collection with a mode per brand, or
// one "Brand / <name>" collection per brand.
const BRAND_NAMES = ["Aurum", "Amber", "Frost"];
const SWATCHES = ["bg", "surface", "surface-raised", "border", "accent", "text", "text-muted", "chest-body", "chest-trim", "chest-dark"];
const TIERS = ["mini", "minor", "major", "grand"];

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const allVars = await figma.variables.getLocalVariablesAsync();
const core = collections.find((c) => c.name === "Core");
const shared = collections.find((c) => c.name === "Brand");
const inColl = (coll, name) => allVars.find((v) => v.variableCollectionId === coll.id && v.name === name);
const coreVar = (name) => inColl(core, name);

let page = figma.root.children.find((p) => p.name === "Brand sheet");
if (!page) {
  page = figma.root.children.length === 1 && figma.root.children[0].children.length === 0 ? figma.root.children[0] : figma.createPage();
  page.name = "Brand sheet";
}
await figma.setCurrentPageAsync(page);

const fill = (variable) => [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", variable)];
const created = [];
let x = 0;
let fontBindingsFailed = 0;

for (const brand of BRAND_NAMES) {
  const coll = shared ?? collections.find((c) => c.name === "Brand / " + brand);
  const v = (name) => inColl(coll, name);
  const modeId = shared ? shared.modes.find((m) => m.name === brand).modeId : coll.modes[0].modeId;
  const displayFamily = v("font/display").valuesByMode[modeId];
  const bodyFamily = v("font/body").valuesByMode[modeId];
  const available = await figma.listAvailableFontsAsync();
  const style = (family, wanted) => {
    const styles = available.filter((f) => f.fontName.family === family).map((f) => f.fontName.style);
    return wanted.find((w) => styles.includes(w)) ?? styles[0];
  };
  const display = { family: displayFamily, style: style(displayFamily, ["Bold", "Regular"]) };
  const body = { family: bodyFamily, style: style(bodyFamily, ["Regular"]) };
  const bodyStrong = { family: bodyFamily, style: style(bodyFamily, ["SemiBold", "Semi Bold", "Bold", "Regular"]) };
  for (const f of [display, body, bodyStrong]) await figma.loadFontAsync(f);

  const text = (chars, font, sizeToken, colorToken) => {
    const t = figma.createText();
    t.fontName = font;
    t.characters = chars;
    // Bind the family too, so a brand's font change reaches this text.
    try {
      t.setBoundVariable("fontFamily", v(font.family === displayFamily ? "font/display" : "font/body"));
    } catch (error) {
      fontBindingsFailed++;
    }
    t.setBoundVariable("fontSize", coreVar("font-size/" + sizeToken));
    t.fills = fill(v("color/" + colorToken));
    return t;
  };
  const stack = (name, direction, gapToken) => {
    const f = figma.createAutoLayout(direction, { name });
    f.fills = [];
    f.setBoundVariable("itemSpacing", coreVar("space/" + gapToken));
    return f;
  };

  page.children.filter((n) => n.name === "Brand sheet / " + brand).forEach((n) => n.remove());
  const frame = figma.createAutoLayout("VERTICAL", { name: "Brand sheet / " + brand });
  if (shared) frame.setExplicitVariableModeForCollection(shared, modeId);
  frame.x = x;
  frame.y = 0;
  frame.resize(520, 100);
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "FIXED";
  frame.fills = fill(v("color/bg"));
  for (const side of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"]) frame.setBoundVariable(side, coreVar("space/8"));
  frame.setBoundVariable("itemSpacing", coreVar("space/6"));

  frame.appendChild(text(brand, display, "2xl", "text"));
  frame.appendChild(text(displayFamily + " for display, " + bodyFamily + " for text", body, "sm", "text-muted"));

  // Colour swatches, two rows of five.
  const swatches = stack("Colours", "HORIZONTAL", "3");
  swatches.layoutWrap = "WRAP";
  swatches.setBoundVariable("counterAxisSpacing", coreVar("space/3"));
  frame.appendChild(swatches);
  swatches.layoutSizingHorizontal = "FILL";
  for (const name of SWATCHES) {
    const item = stack("color/" + name, "VERTICAL", "1");
    const chip = figma.createRectangle();
    chip.resize(80, 48);
    chip.fills = fill(v("color/" + name));
    chip.strokes = fill(v("color/border"));
    chip.strokeWeight = 1;
    for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) chip.setBoundVariable(corner, v("radius/sm"));
    item.appendChild(chip);
    item.appendChild(text(name, body, "xs", "text-muted"));
    swatches.appendChild(item);
  }

  // Reward tiers, lowest to highest.
  const tiers = stack("Reward tiers", "HORIZONTAL", "4");
  frame.appendChild(tiers);
  for (const name of TIERS) {
    const item = stack("tier/" + name, "HORIZONTAL", "2");
    item.counterAxisAlignItems = "CENTER";
    const dot = figma.createEllipse();
    dot.resize(16, 16);
    dot.fills = fill(v("color/tier-" + name));
    item.appendChild(dot);
    item.appendChild(text(name, bodyStrong, "sm", "text"));
    tiers.appendChild(item);
  }

  // A card with the primary button, to show surface, radius and accent together.
  const card = figma.createAutoLayout("VERTICAL", { name: "Card" });
  frame.appendChild(card);
  card.layoutSizingHorizontal = "FILL";
  card.fills = fill(v("color/surface"));
  card.strokes = fill(v("color/border"));
  card.strokeWeight = 1;
  card.counterAxisAlignItems = "CENTER";
  for (const side of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"]) card.setBoundVariable(side, coreVar("space/6"));
  card.setBoundVariable("itemSpacing", coreVar("space/3"));
  for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) card.setBoundVariable(corner, v("radius/md"));
  card.appendChild(text("12,500", display, "2xl", "text"));
  card.appendChild(text("COINS", bodyStrong, "xs", "text-muted"));

  const button = figma.createAutoLayout("HORIZONTAL", { name: "Button" });
  button.fills = fill(v("color/accent"));
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.setBoundVariable("paddingLeft", coreVar("space/6"));
  button.setBoundVariable("paddingRight", coreVar("space/6"));
  button.setBoundVariable("paddingTop", coreVar("space/3"));
  button.setBoundVariable("paddingBottom", coreVar("space/3"));
  for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) button.setBoundVariable(corner, v("radius/lg"));
  button.appendChild(text("Collect", bodyStrong, "md", "on-accent"));
  card.appendChild(button);

  created.push({ brand, id: frame.id, width: frame.width, height: frame.height, fonts: [display, body] });
  x += frame.width + 80;
}

return { pageId: page.id, fontBindingsFailed, created };
