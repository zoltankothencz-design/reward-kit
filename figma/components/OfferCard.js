// OfferCard: Brand (3) x Featured (false, true) = 6 variants, with text properties Name, Coins, Bonus, Price.
// The card uses radius-md like the coded card; radius-lg belongs to the pill buttons and the badge.
const FEATURED = ["false", "true"];
removeSet("OfferCard");

const variants = [];
for (const b of BRANDS) for (const feat of FEATURED) {
  const featured = feat === "true";
  const dark = bv(b, "color/chest-dark"), gold = bv(b, "color/chest-trim"), accent = bv(b, "color/accent");
  const comp = figma.createComponent();
  comp.name = `Brand=${b}, Featured=${feat}`;
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.resize(260, 100);
  comp.primaryAxisAlignItems = "MIN"; comp.counterAxisAlignItems = "CENTER";
  comp.fills = [paint(bv(b, "color/surface"))];
  comp.strokes = [paint(featured ? accent : bv(b, "color/border"))];
  comp.strokeWeight = featured ? 3 : 1;
  bindAll(comp, corners, bv(b, "radius/md"));
  comp.setBoundVariable("itemSpacing", cv("space/2"));
  padding(comp, [6, 6, 6, 6]);

  if (featured) {
    const badge = figma.createFrame();
    badge.name = "Badge"; badge.layoutMode = "HORIZONTAL";
    badge.primaryAxisSizingMode = "AUTO"; badge.counterAxisSizingMode = "AUTO";
    badge.fills = [paint(accent)];
    bindAll(badge, corners, bv(b, "radius/lg"));
    padding(badge, [1, 3, 1, 3]);
    badge.appendChild(label(b, "Most popular", "strong", "xs", bv(b, "color/on-accent"), "Badge text"));
    comp.appendChild(badge);
  }
  comp.appendChild(label(b, "Lucky bundle", "strong", "lg", bv(b, "color/text"), "Name"));
  const icon = figma.createFrame();
  icon.name = "Coin icons"; icon.fills = []; icon.clipsContent = false; icon.resize(64, 40);
  for (const [x, y] of [[0, 12], [20, 0], [40, 12]]) {
    const coin = figma.createEllipse();
    coin.name = "Coin"; coin.resize(24, 24); coin.x = x; coin.y = y;
    coin.fills = [paint(gold)]; coin.strokes = [paint(dark)]; coin.strokeWeight = 1.5;
    icon.appendChild(coin);
  }
  comp.appendChild(icon);
  comp.appendChild(label(b, "30,000", "display", "2xl", bv(b, "color/text"), "Coins"));
  comp.appendChild(label(b, "coins", "body", "sm", bv(b, "color/text-muted"), "Unit"));
  comp.appendChild(label(b, "+50% bonus", "strong", "sm", bv(b, "color/tier-major"), "Bonus"));
  const buy = figma.createFrame();
  buy.name = "Buy button"; buy.layoutMode = "HORIZONTAL";
  buy.primaryAxisSizingMode = "AUTO"; buy.counterAxisSizingMode = "AUTO";
  buy.primaryAxisAlignItems = "CENTER"; buy.counterAxisAlignItems = "CENTER";
  buy.fills = [paint(accent)];
  bindAll(buy, corners, bv(b, "radius/lg"));
  padding(buy, [3, 8, 3, 8]);
  buy.appendChild(label(b, "$7.99", "strong", "md", bv(b, "color/on-accent"), "Price"));
  comp.appendChild(buy);
  comp.appendChild(label(b, "Ends in 1:59:01", "body", "sm", bv(b, "color/text-muted"), "Timer"));
  variants.push(comp);
}
const y = nextY();
const set = figma.combineAsVariants(variants, page);
set.name = "OfferCard";
set.description = "A coin pack with a fixed anatomy: optional badge, name, coins, bonus, price button, countdown. Variants: Brand (Aurum, Amber, Frost) and Featured (true adds a badge and an accent edge). Text properties: Name, Coins, Bonus, Price. In code the card lifts on hover and the coins bounce when bought (docs/MOTION.md). Fills, strokes, spacing, radii, fonts and sizes are bound to variables.";
const props = {
  Name: set.addComponentProperty("Name", "TEXT", "Lucky bundle"),
  Coins: set.addComponentProperty("Coins", "TEXT", "30,000"),
  Bonus: set.addComponentProperty("Bonus", "TEXT", "+50% bonus"),
  Price: set.addComponentProperty("Price", "TEXT", "$7.99"),
};
// Match text nodes only: a frame may share a name with a text node.
for (const v of set.children) for (const k of Object.keys(props)) v.findOne((n) => n.type === "TEXT" && n.name === k).componentPropertyReferences = { characters: props[k] };
const cellW = 340, cellH = 420;
set.children.forEach((v) => {
  const m = parts(v);
  v.x = 40 + FEATURED.indexOf(m.Featured) * cellW;
  v.y = 40 + BRANDS.indexOf(m.Brand) * cellH;
});
set.resize(40 + FEATURED.length * cellW, 40 + BRANDS.length * cellH);
set.x = 0; set.y = y;
return { setId: set.id, variants: set.children.length, size: [set.width, set.height] };
