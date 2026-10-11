// PrizeWheel: Brand (3) x State (spin, locked) = 6 variants. Slices follow WHEEL_PRIZES in src/lib/economy.ts.
const STATES = ["spin", "locked"];
const PRIZES = [["500", "mini"], ["2,000", "minor"], ["750", "mini"], ["5,000", "major"], ["1,000", "mini"], ["3,000", "minor"], ["600", "mini"], ["25,000", "grand"]];
const CX = 100, CY = 110, R = 86;
removeSet("PrizeWheel");

const variants = [];
for (const b of BRANDS) for (const state of STATES) {
  const dark = bv(b, "color/chest-dark"), gold = bv(b, "color/chest-trim");
  const comp = figma.createComponent();
  comp.name = `Brand=${b}, State=${state}`;
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [paint(bv(b, "color/bg"))];
  bindAll(comp, corners, bv(b, "radius/md"));
  comp.setBoundVariable("itemSpacing", cv("space/4"));
  padding(comp, [4, 4, 4, 4]);

  const art = figma.createFrame();
  art.name = "Wheel"; art.fills = []; art.clipsContent = false; art.resize(200, 220);
  comp.appendChild(art);
  PRIZES.forEach(([, tier], i) => {
    const slice = figma.createEllipse();
    slice.name = "Slice " + (i + 1) + " " + tier;
    slice.resize(R * 2, R * 2); slice.x = CX - R; slice.y = CY - R;
    slice.arcData = { startingAngle: -Math.PI / 2 + (i * Math.PI) / 4, endingAngle: -Math.PI / 2 + ((i + 1) * Math.PI) / 4, innerRadius: 0 };
    slice.fills = [paint(bv(b, "color/tier-" + tier))];
    slice.strokes = [paint(dark)]; slice.strokeWeight = 1.5;
    art.appendChild(slice);
  });
  // Labels sit on the radius at 70%, turned to follow the slice, as in the coded wheel.
  PRIZES.forEach(([amount], i) => {
    const theta = ((i + 0.5) * Math.PI) / 4;
    const t = label(b, amount, "display", "xs", bv(b, "color/text"), "Label " + amount);
    t.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    t.strokes = [paint(dark)]; t.strokeWeight = 2.5; t.strokeAlign = "OUTSIDE";
    art.appendChild(t);
    const w = t.width, h = t.height, r = R * 0.7;
    const cx = CX + r * Math.sin(theta), cy = CY - r * Math.cos(theta);
    const a = Math.cos(theta), s = Math.sin(theta);
    t.relativeTransform = [[a, -s, cx - (a * w / 2 - s * h / 2)], [s, a, cy - (s * w / 2 + a * h / 2)]];
  });
  const rim = figma.createEllipse();
  rim.name = "Rim"; rim.resize(R * 2, R * 2); rim.x = CX - R; rim.y = CY - R;
  rim.fills = []; rim.strokes = [paint(gold)]; rim.strokeWeight = 10;
  art.appendChild(rim);
  const edge = figma.createEllipse();
  edge.name = "Rim edge"; edge.resize(R * 2 + 10, R * 2 + 10); edge.x = CX - R - 5; edge.y = CY - R - 5;
  edge.fills = []; edge.strokes = [paint(dark)]; edge.strokeWeight = 1.5;
  art.appendChild(edge);
  const hub = figma.createEllipse();
  hub.name = "Hub"; hub.resize(28, 28); hub.x = CX - 14; hub.y = CY - 14;
  hub.fills = [paint(gold)]; hub.strokes = [paint(dark)]; hub.strokeWeight = 1.5;
  art.appendChild(hub);
  const pointer = figma.createVector();
  pointer.name = "Pointer";
  pointer.vectorPaths = [{ windingRule: "NONZERO", data: "M 0 0 L 20 0 L 10 30 Z" }];
  pointer.x = 90; pointer.y = 2;
  pointer.fills = [paint(gold)]; pointer.strokes = [paint(dark)]; pointer.strokeWeight = 1.5;
  art.appendChild(pointer);

  const btn = figma.createFrame();
  btn.name = "Button"; btn.layoutMode = "HORIZONTAL";
  btn.primaryAxisSizingMode = "AUTO"; btn.counterAxisSizingMode = "AUTO";
  btn.primaryAxisAlignItems = "CENTER"; btn.counterAxisAlignItems = "CENTER";
  btn.fills = [paint(bv(b, "color/accent"))];
  bindAll(btn, corners, bv(b, "radius/lg"));
  padding(btn, [3, 6, 3, 6]);
  btn.appendChild(label(b, state === "spin" ? "Spin" : "Come back tomorrow", "strong", "md", bv(b, "color/on-accent"), "Button label"));
  if (state === "locked") btn.opacity = 0.6;
  comp.appendChild(btn);
  variants.push(comp);
}
const y = nextY();
const set = figma.combineAsVariants(variants, page);
set.name = "PrizeWheel";
set.description = "A wheel of prizes the player spins once. Variants: Brand (Aurum, Amber, Frost) and State (spin, locked: the button reads 'Come back tomorrow' and is disabled). Slices follow the prize table in src/lib/economy.ts. A static drawing: in code the wheel turns and lands on the slice the parent chose, see docs/MOTION.md. Fills, strokes, spacing, fonts and sizes are bound to variables.";
const cellW = 300, cellH = 400;
set.children.forEach((v) => {
  const m = parts(v);
  v.x = 40 + STATES.indexOf(m.State) * cellW;
  v.y = 40 + BRANDS.indexOf(m.Brand) * cellH;
});
set.resize(40 + STATES.length * cellW, 40 + BRANDS.length * cellH);
set.x = 0; set.y = y;
return { setId: set.id, variants: set.children.length, size: [set.width, set.height] };
