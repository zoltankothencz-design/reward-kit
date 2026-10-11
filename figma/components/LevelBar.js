// LevelBar: Brand (3) x Progress (low 25%, mid 60%, full 100%) = 9 variants.
const PROGRESS = [["low", 0.25, "30 / 120 XP"], ["mid", 0.6, "72 / 120 XP"], ["full", 1, "120 / 120 XP"]];
removeSet("LevelBar");

const variants = [];
for (const b of BRANDS) for (const [name, ratio, xpText] of PROGRESS) {
  const dark = bv(b, "color/chest-dark"), gold = bv(b, "color/chest-trim");
  const comp = figma.createComponent();
  comp.name = `Brand=${b}, Progress=${name}`;
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [paint(bv(b, "color/bg"))];
  bindAll(comp, corners, bv(b, "radius/md"));
  comp.setBoundVariable("itemSpacing", cv("space/4"));
  padding(comp, [4, 4, 4, 4]);

  const badge = figma.createFrame();
  badge.name = "Badge"; badge.layoutMode = "VERTICAL";
  badge.primaryAxisSizingMode = "FIXED"; badge.counterAxisSizingMode = "FIXED";
  badge.resize(64, 64);
  badge.primaryAxisAlignItems = "CENTER"; badge.counterAxisAlignItems = "CENTER";
  badge.cornerRadius = 32;
  badge.fills = [paint(gold)];
  badge.strokes = [paint(dark)]; badge.strokeWeight = 2;
  const small = label(b, "Level", "strong", "xs", dark, "Badge label");
  small.textCase = "UPPER"; small.fontSize = 10;
  badge.appendChild(small);
  badge.appendChild(label(b, "12", "display", "xl", dark, "Level number"));
  comp.appendChild(badge);

  const body = figma.createFrame();
  body.name = "Body"; body.layoutMode = "VERTICAL"; body.fills = [];
  body.primaryAxisSizingMode = "AUTO"; body.counterAxisSizingMode = "AUTO";
  body.setBoundVariable("itemSpacing", cv("space/1"));
  const track = figma.createFrame();
  track.name = "Track"; track.resize(240, 16); track.clipsContent = true;
  track.fills = [paint(bv(b, "color/surface-raised"))];
  track.strokes = [paint(bv(b, "color/border"))]; track.strokeWeight = 1;
  bindAll(track, corners, bv(b, "radius/lg"));
  const fill = figma.createRectangle();
  fill.name = "Fill"; fill.resize(Math.max(1, Math.round(240 * ratio)), 16); fill.x = 0; fill.y = 0;
  fill.fills = [paint(gold)];
  bindAll(fill, corners, bv(b, "radius/lg"));
  track.appendChild(fill);
  body.appendChild(track);
  body.appendChild(label(b, xpText, "body", "sm", bv(b, "color/text-muted"), "XP text"));
  comp.appendChild(body);
  variants.push(comp);
}
const y = nextY();
const set = figma.combineAsVariants(variants, page);
set.name = "LevelBar";
set.description = "Progress toward a threshold, with the current step in a round badge. Variants: Brand (Aurum, Amber, Frost) and Progress (low 25%, mid 60%, full 100%). The Level property sets the badge number. In code the bar glides to the new value and the badge pops on a level change (docs/MOTION.md). Fills, strokes, spacing, radii, fonts and sizes are bound to variables.";
const level = set.addComponentProperty("Level", "TEXT", "12");
for (const v of set.children) v.findOne((n) => n.type === "TEXT" && n.name === "Level number").componentPropertyReferences = { characters: level };
const cellW = 420, cellH = 140;
set.children.forEach((v) => {
  const m = parts(v);
  v.x = 40 + PROGRESS.findIndex((p) => p[0] === m.Progress) * cellW;
  v.y = 40 + BRANDS.indexOf(m.Brand) * cellH;
});
set.resize(40 + PROGRESS.length * cellW, 40 + BRANDS.length * cellH);
set.x = 0; set.y = y;
return { setId: set.id, variants: set.children.length, size: [set.width, set.height] };
