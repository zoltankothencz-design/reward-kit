// DailyStreak: a tile set (Brand x State x Bonus = 18) and a seven-day row set (Brand = 3) made of tile instances.
// Day amounts follow DAILY_REWARDS in src/lib/economy.ts.
const STATES = ["claimed", "today", "upcoming"];
const BONUS = ["false", "true"];
const REWARDS = [500, 750, 1000, 1500, 2500, 4000, 12500];
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
removeSet("DailyStreakTile");
removeSet("DailyStreak");

const tiles = [];
for (const b of BRANDS) for (const state of STATES) for (const bonus of BONUS) {
  const dark = bv(b, "color/chest-dark"), gold = bv(b, "color/chest-trim");
  const comp = figma.createComponent();
  comp.name = `Brand=${b}, State=${state}, Bonus=${bonus}`;
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
  comp.resize(92, 112);
  comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [paint(bv(b, state === "today" ? "color/surface-raised" : "color/surface"))];
  comp.strokes = [paint(state === "today" ? gold : bv(b, "color/border"))];
  comp.strokeWeight = state === "today" ? 2 : 1;
  comp.strokeAlign = "INSIDE";
  bindAll(comp, corners, bv(b, "radius/md"));
  comp.setBoundVariable("itemSpacing", cv("space/1"));
  padding(comp, [3, 1, 3, 1]);
  const day = label(b, "Day 1", "strong", "xs", bv(b, "color/text-muted"), "Day");
  day.textCase = "UPPER";
  comp.appendChild(day);
  const coin = figma.createEllipse();
  coin.name = "Coin icon"; coin.resize(bonus === "true" ? 40 : 32, bonus === "true" ? 40 : 32);
  coin.fills = [paint(gold)]; coin.strokes = [paint(dark)]; coin.strokeWeight = 1.5;
  comp.appendChild(coin);
  const coins = label(b, "500", "display", "md", bv(b, "color/text"), "Coins");
  comp.appendChild(coins);
  if (state === "upcoming") { coin.opacity = 0.6; coins.opacity = 0.6; }
  if (state === "claimed") { day.opacity = 0.25; coin.opacity = 0.25; coins.opacity = 0.25; }
  if (bonus === "true") {
    const bonusLabel = label(b, "Bonus", "strong", "xs", gold, "Bonus label");
    bonusLabel.textCase = "UPPER";
    if (state === "claimed") bonusLabel.opacity = 0.25;
    comp.appendChild(bonusLabel);
  }
  if (state === "claimed") {
    const check = figma.createVector();
    check.name = "Check";
    check.vectorPaths = [{ windingRule: "NONE", data: "M 0 0 L 6.75 6.75 L 21 -7.5" }];
    comp.appendChild(check);
    check.layoutPositioning = "ABSOLUTE";
    check.x = (comp.width - check.width) / 2; check.y = (comp.height - check.height) / 2;
    check.fills = [];
    check.strokes = [paint(bv(b, "color/tier-major"))];
    check.strokeWeight = 3; check.strokeCap = "ROUND"; check.strokeJoin = "ROUND";
  }
  tiles.push(comp);
}
const tileY = nextY();
const tileSet = figma.combineAsVariants(tiles, page);
tileSet.name = "DailyStreakTile";
tileSet.description = "One day of the daily streak. Variants: Brand (Aurum, Amber, Frost), State (claimed: dimmed with a check mark, today: gold edge, upcoming: quiet) and Bonus (true for the last day). Text properties: Day, Coins. In code today's tile settles once and the check mark draws itself (docs/MOTION.md). Fills, strokes, spacing, radii, fonts and sizes are bound to variables.";
const dayKey = tileSet.addComponentProperty("Day", "TEXT", "Day 1");
const coinsKey = tileSet.addComponentProperty("Coins", "TEXT", "500");
for (const v of tileSet.children) {
  v.findOne((n) => n.type === "TEXT" && n.name === "Day").componentPropertyReferences = { characters: dayKey };
  v.findOne((n) => n.type === "TEXT" && n.name === "Coins").componentPropertyReferences = { characters: coinsKey };
}
const tw = 130, th = 160;
tileSet.children.forEach((v) => {
  const m = parts(v);
  v.x = 40 + (STATES.indexOf(m.State) * 2 + BONUS.indexOf(m.Bonus)) * tw;
  v.y = 40 + BRANDS.indexOf(m.Brand) * th;
});
tileSet.resize(40 + STATES.length * 2 * tw, 40 + BRANDS.length * th);
tileSet.x = 0; tileSet.y = tileY;

const rows = [];
for (const b of BRANDS) {
  const comp = figma.createComponent();
  comp.name = `Brand=${b}`;
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
  comp.counterAxisAlignItems = "CENTER";
  comp.fills = [paint(bv(b, "color/bg"))];
  bindAll(comp, corners, bv(b, "radius/md"));
  comp.setBoundVariable("itemSpacing", cv("space/6"));
  padding(comp, [4, 4, 4, 4]);
  const strip = figma.createFrame();
  strip.name = "Days"; strip.layoutMode = "HORIZONTAL"; strip.fills = [];
  strip.primaryAxisSizingMode = "AUTO"; strip.counterAxisSizingMode = "AUTO";
  strip.setBoundVariable("itemSpacing", cv("space/2"));
  comp.appendChild(strip);
  REWARDS.forEach((amount, i) => {
    const state = i < 2 ? "claimed" : i === 2 ? "today" : "upcoming";
    const bonus = i === REWARDS.length - 1 ? "true" : "false";
    const variant = tileSet.children.find((v) => v.name === `Brand=${b}, State=${state}, Bonus=${bonus}`);
    const inst = variant.createInstance();
    inst.name = "Day " + (i + 1);
    inst.setProperties({ [dayKey]: "Day " + (i + 1), [coinsKey]: fmt(amount) });
    strip.appendChild(inst);
  });
  const btn = figma.createFrame();
  btn.name = "Collect button"; btn.layoutMode = "HORIZONTAL";
  btn.primaryAxisSizingMode = "AUTO"; btn.counterAxisSizingMode = "AUTO";
  btn.primaryAxisAlignItems = "CENTER"; btn.counterAxisAlignItems = "CENTER";
  btn.fills = [paint(bv(b, "color/accent"))];
  bindAll(btn, corners, bv(b, "radius/lg"));
  padding(btn, [3, 6, 3, 6]);
  btn.appendChild(label(b, "Collect day 3", "strong", "md", bv(b, "color/on-accent"), "Button label"));
  comp.appendChild(btn);
  rows.push(comp);
}
const rowY = nextY();
const rowSet = figma.combineAsVariants(rows, page);
rowSet.name = "DailyStreak";
rowSet.description = "Seven days of rewards with today marked and past days checked off, plus the collect button. Variants: Brand (Aurum, Amber, Frost). Built from DailyStreakTile instances: change a day's State on the instance to show another day as today. Fills, strokes, spacing, radii, fonts and sizes are bound to variables.";
rowSet.children.forEach((v, i) => { v.x = 40; v.y = 40 + i * (v.height + 40); });
rowSet.resize(40 + rowSet.children[0].width + 40, 40 + rowSet.children.length * (rowSet.children[0].height + 40));
rowSet.x = 0; rowSet.y = rowY;
return { tileSetId: tileSet.id, tiles: tileSet.children.length, rowSetId: rowSet.id, rows: rowSet.children.length };
