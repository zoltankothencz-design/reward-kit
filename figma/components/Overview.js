// Overview: one frame on its own page that shows the five components, in each brand, as instances.
// Run it LAST: it needs the sets made by the other component scripts. Rebuilding replaces the frame.
const overviewPage = figma.root.children.find((p) => p.name === "Overview") ?? figma.createPage();
overviewPage.name = "Overview";
overviewPage.children.filter((n) => n.name === "Reward Kit overview").forEach((n) => n.remove());

const setOf = (name) => {
  const s = page.children.find((n) => n.type === "COMPONENT_SET" && n.name === name);
  if (!s) throw new Error("Run the component scripts first: missing set " + name);
  return s;
};
const SETS = { chest: setOf("RewardChest"), wheel: setOf("PrizeWheel"), level: setOf("LevelBar"), offer: setOf("OfferCard"), streak: setOf("DailyStreak") };
const variant = (set, name) => {
  const v = set.children.find((c) => c.name === name);
  if (!v) throw new Error("Missing variant " + name);
  return v;
};
const key = (set, prefix) => Object.keys(set.componentPropertyDefinitions).find((k) => k.startsWith(prefix + "#"));

function autoLayout(name, direction, gapToken) {
  const f = figma.createFrame();
  f.name = name; f.layoutMode = direction; f.fills = [];
  f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO";
  f.setBoundVariable("itemSpacing", cv("space/" + gapToken));
  return f;
}

const root = figma.createFrame();
root.name = "Reward Kit overview";
root.layoutMode = "VERTICAL";
root.primaryAxisSizingMode = "AUTO"; root.counterAxisSizingMode = "AUTO";
root.fills = [paint(bv("Frost", "color/surface-raised"))];
root.setBoundVariable("itemSpacing", cv("space/12"));
padding(root, [12, 12, 12, 12]);
overviewPage.appendChild(root);

const head = autoLayout("Heading", "VERTICAL", 2);
head.appendChild(label("Frost", "Reward Kit", "display", "3xl", bv("Frost", "color/text"), "Title"));
head.appendChild(label("Frost", "Five components in three brands, all bound to the same variables. Switch brand by choosing another Brand variant.", "body", "md", bv("Frost", "color/text-muted"), "Subtitle"));
root.appendChild(head);

for (const b of BRANDS) {
  const section = figma.createFrame();
  section.name = "Brand " + b;
  section.layoutMode = "VERTICAL";
  section.primaryAxisSizingMode = "AUTO"; section.counterAxisSizingMode = "AUTO";
  section.fills = [paint(bv(b, "color/bg"))];
  // radius-md, not radius-lg: Frost's large radius is a pill and would clip the content
  bindAll(section, corners, bv(b, "radius/md"));
  section.clipsContent = false;
  section.setBoundVariable("itemSpacing", cv("space/6"));
  padding(section, [8, 8, 8, 8]);
  section.appendChild(label(b, b, "display", "2xl", bv(b, "color/text"), "Brand name"));

  const rowA = autoLayout("Row: chest, wheel, offers", "HORIZONTAL", 6);
  rowA.counterAxisAlignItems = "MIN";
  const chestOpen = variant(SETS.chest, `Brand=${b}, Tier=major, State=open`).createInstance();
  const chestClosed = variant(SETS.chest, `Brand=${b}, Tier=grand, State=closed`).createInstance();
  chestClosed.setProperties({ [key(SETS.chest, "Amount")]: "250,000" });
  const wheel = variant(SETS.wheel, `Brand=${b}, State=spin`).createInstance();
  const featured = variant(SETS.offer, `Brand=${b}, Featured=true`).createInstance();
  const plain = variant(SETS.offer, `Brand=${b}, Featured=false`).createInstance();
  plain.setProperties({ [key(SETS.offer, "Name")]: "Starter", [key(SETS.offer, "Coins")]: "5,000", [key(SETS.offer, "Bonus")]: " ", [key(SETS.offer, "Price")]: "$1.99" });
  for (const inst of [chestOpen, chestClosed, wheel, featured, plain]) rowA.appendChild(inst);
  section.appendChild(rowA);

  const rowB = autoLayout("Row: level bar and daily streak", "HORIZONTAL", 6);
  rowB.counterAxisAlignItems = "CENTER";
  rowB.appendChild(variant(SETS.level, `Brand=${b}, Progress=mid`).createInstance());
  rowB.appendChild(variant(SETS.streak, `Brand=${b}`).createInstance());
  section.appendChild(rowB);
  root.appendChild(section);
}
root.x = 0; root.y = 0;
return { pageId: overviewPage.id, frameId: root.id, size: [root.width, root.height], sections: BRANDS.length };
