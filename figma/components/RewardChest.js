// RewardChest: Brand (3) x Tier (4) x State (closed, open) = 24 variants.
// A simplified static drawing of the coded chest. Every fill, stroke, space, radius, font and size is bound to a variable.
const TIERS = ["mini", "minor", "major", "grand"];
const STATES = ["closed", "open"];
removeSet("RewardChest");

function shape(parent, kind, name, x, y, w, h, fillVariable, brand, opts = {}) {
  const n = kind === "ellipse" ? figma.createEllipse() : figma.createRectangle();
  n.name = name; n.x = x; n.y = y; n.resize(w, h);
  n.fills = fillVariable ? [paint(fillVariable)] : [];
  if (opts.opacity !== undefined) n.opacity = opts.opacity;
  if (opts.stroke) { n.strokes = [paint(bv(brand, "color/chest-dark"))]; n.strokeWeight = 1.5; }
  if (opts.radius !== undefined) n.cornerRadius = opts.radius;
  if (opts.topRadius !== undefined) { n.topLeftRadius = opts.topRadius; n.topRightRadius = opts.topRadius; n.bottomLeftRadius = 0; n.bottomRightRadius = 0; }
  parent.appendChild(n);
  return n;
}

const variants = [];
for (const b of BRANDS) for (const tier of TIERS) for (const state of STATES) {
  const wood = bv(b, "color/chest-body"), gold = bv(b, "color/chest-trim"), dark = bv(b, "color/chest-dark"), tierVar = bv(b, "color/tier-" + tier);
  const open = state === "open";
  const comp = figma.createComponent();
  comp.name = `Brand=${b}, Tier=${tier}, State=${state}`;
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [paint(bv(b, "color/bg"))];
  bindAll(comp, corners, bv(b, "radius/md"));
  comp.setBoundVariable("itemSpacing", cv("space/2"));
  padding(comp, [4, 4, 4, 4]);

  const art = figma.createFrame();
  art.name = "Art"; art.fills = []; art.clipsContent = false; art.resize(200, 180);
  comp.appendChild(art);
  if (open) shape(art, "ellipse", "Halo", 8, 0, 184, 184, tierVar, b, { opacity: 0.35 });
  shape(art, "ellipse", "Floor", 38, 159, 124, 14, dark, b, { opacity: 0.45 });
  if (open) {
    shape(art, "rect", "Inside", 44, 80, 112, 26, dark, b);
    shape(art, "ellipse", "Glow", 48, 86, 104, 28, tierVar, b, { opacity: 0.85 });
    for (const [x, y] of [[64, 96], [80, 90], [100, 87], [120, 90], [136, 96], [90, 95], [112, 96]]) shape(art, "ellipse", "Coin", x - 8, y - 8, 16, 16, gold, b, { stroke: true });
  }
  shape(art, "rect", "Body", 40, 98, 120, 66, wood, b, { stroke: true, radius: 6 });
  shape(art, "rect", "Trim top", 40, 98, 120, 10, gold, b);
  shape(art, "rect", "Trim bottom", 40, 154, 120, 10, gold, b);
  shape(art, "rect", "Strap left", 54, 98, 13, 66, gold, b);
  shape(art, "rect", "Strap right", 133, 98, 13, 66, gold, b);
  shape(art, "rect", "Lock plate", 86, 101, 28, 32, gold, b, { stroke: true, radius: 5 });
  shape(art, "ellipse", "Gem", 93, 109, 14, 14, tierVar, b, { stroke: true });
  const lid = figma.createFrame();
  lid.name = "Lid"; lid.fills = []; lid.clipsContent = false; lid.resize(128, 52);
  lid.x = 36; lid.y = open ? 12 : 48;
  art.appendChild(lid);
  shape(lid, "rect", "Lid shell", 0, 0, 128, 52, wood, b, { stroke: true, topRadius: 28 });
  shape(lid, "rect", "Lid trim", 0, 42, 128, 10, gold, b);
  shape(lid, "rect", "Lid strap left", 18, 0, 13, 52, gold, b);
  shape(lid, "rect", "Lid strap right", 97, 0, 13, 52, gold, b);

  const tierText = label(b, tier, "strong", "xs", tierVar, "Tier label");
  tierText.textCase = "UPPER";
  comp.appendChild(tierText);
  comp.appendChild(label(b, "12,500", "display", "2xl", bv(b, "color/text"), "Amount"));
  variants.push(comp);
}

const y = nextY();
const set = figma.combineAsVariants(variants, page);
set.name = "RewardChest";
set.description = "The payoff moment: a reward is revealed and collected. Variants: Brand (Aurum, Amber, Frost), Tier (mini, minor, major, grand) and State (closed, open). A simplified static drawing of the coded primitive; its motion is specified in docs/MOTION.md. Fills, strokes, spacing, fonts and sizes are bound to variables.";
const amount = set.addComponentProperty("Amount", "TEXT", "12,500");
for (const v of set.children) v.findOne((n) => n.type === "TEXT" && n.name === "Amount").componentPropertyReferences = { characters: amount };
const cellW = 260, cellH = 300;
set.children.forEach((v) => {
  const m = parts(v);
  v.x = 40 + (TIERS.indexOf(m.Tier) * 2 + STATES.indexOf(m.State)) * cellW;
  v.y = 40 + BRANDS.indexOf(m.Brand) * cellH;
});
set.resize(40 + TIERS.length * 2 * cellW, 40 + BRANDS.length * cellH);
set.x = 0; set.y = y;
return { setId: set.id, variants: set.children.length, size: [set.width, set.height] };
