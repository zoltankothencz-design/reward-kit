// Checks that prefers-reduced-motion really switches the motion off.
//   npm run test:motion
// It starts the dev server, opens the gallery in a real browser with the
// setting emulated, and checks that nothing animates and that every element
// still lands on its end state. A control run without the setting must show
// the motion, so the test cannot pass just because it looks at nothing.
// It needs Chrome or Edge installed; it is not part of `npm run build`.
import { createServer } from "vite";
import { chromium } from "playwright-core";

const PORT = 5199;
const failures = [];
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : `  ${detail}`}`);
  if (!ok) failures.push(name);
};

async function launch() {
  for (const channel of ["chrome", "msedge"]) {
    try {
      return await chromium.launch({ channel });
    } catch {
      /* try the next one */
    }
  }
  throw new Error("Neither Chrome nor Edge could be started.");
}

// The label of the slice under the pointer, read from the rendered geometry.
const sliceUnderPointer = (page) =>
  page.evaluate(() => {
    const wheel = document.querySelector(".rk-wheel");
    const art = wheel.querySelector(".rk-wheel__art").getBoundingClientRect();
    const cx = art.left + art.width / 2;
    const cy = art.top + (art.height * 110) / 220;
    return [...wheel.querySelectorAll(".rk-wheel__label")]
      .map((t) => {
        const r = t.getBoundingClientRect();
        return { text: t.textContent, dx: Math.abs(r.left + r.width / 2 - cx), above: r.top + r.height / 2 < cy };
      })
      .filter((l) => l.above)
      .sort((a, b) => a.dx - b.dx)[0].text;
  });

async function measure(browser, reducedMotion) {
  const context = await browser.newContext({ reducedMotion, viewport: { width: 1000, height: 900 } });
  const page = await context.newPage();
  await page.goto(`http://localhost:${PORT}/#gallery`);
  await page.waitForSelector(".rk-wheel");

  const wheel = page.locator(".rk-wheel").first();
  const chest = page.locator(".workbench .rk-chest");
  const css = (selector, property) => page.locator(selector).first().evaluate((el, p) => getComputedStyle(el)[p], property);

  const out = {
    wheelTransition: await css(".rk-wheel__rotor", "transitionDuration"),
    levelTransition: await css(".rk-level__fill", "transitionDuration"),
  };

  await wheel.locator(".rk-button").click();
  await page.waitForTimeout(150);
  out.wheelState = await wheel.getAttribute("data-state");
  out.wheelResult = (await wheel.locator(".rk-wheel__result").textContent()).replace("Landed on ", "");
  out.wheelUnderPointer = await sliceUnderPointer(page);
  out.wheelFlash = await css(".rk-wheel[data-state=landed] .rk-wheel__flash", "animationName");

  await chest.locator(".rk-button").click();
  await page.waitForTimeout(150);
  out.chestState = await chest.getAttribute("data-state");
  out.chestAmount = await chest.locator(".rk-chest__amount").textContent();
  out.chestLid = await chest.locator(".rk-chest__lid").evaluate((el) => getComputedStyle(el).animationName);

  await page.getByRole("button", { name: /\+700 XP/ }).click();
  await page.waitForTimeout(100);
  out.levelBadge = (await page.locator(".rk-level__badge").first().textContent()).replace(/\D/g, "");
  out.levelBadgeAnimation = await css(".rk-level__badge", "animationName");

  out.running = await page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === "running").map((a) => a.animationName || a.transitionProperty),
  );
  await context.close();
  return out;
}

const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: "error" });
await server.listen();
const browser = await launch();
try {
  const reduced = await measure(browser, "reduce");
  check("wheel has no transition", reduced.wheelTransition === "0s", reduced.wheelTransition);
  check("wheel has landed at once", reduced.wheelState === "landed", reduced.wheelState);
  check("wheel stops on the slice it reports", reduced.wheelUnderPointer === reduced.wheelResult, `${reduced.wheelUnderPointer} vs ${reduced.wheelResult}`);
  check("wheel winner does not flash", reduced.wheelFlash === "none", reduced.wheelFlash);
  check("chest is open at once with the final amount", reduced.chestState === "open" && reduced.chestAmount === "12,500", `${reduced.chestState} ${reduced.chestAmount}`);
  check("chest lid does not animate", reduced.chestLid === "none", reduced.chestLid);
  check("level bar does not transition", reduced.levelTransition === "0s", reduced.levelTransition);
  check("level badge shows the new level without a pop", reduced.levelBadge.startsWith("12") && reduced.levelBadgeAnimation === "none", `${reduced.levelBadge} ${reduced.levelBadgeAnimation}`);
  check("nothing on the page is animating", reduced.running.length === 0, reduced.running.join(", "));

  // Control: the same checks without the setting must find motion.
  const normal = await measure(browser, "no-preference");
  check("control: wheel transitions without the setting", normal.wheelTransition !== "0s", normal.wheelTransition);
  check("control: chest lid animates without the setting", normal.chestLid !== "none", normal.chestLid);
  check("control: level bar transitions without the setting", normal.levelTransition !== "0s", normal.levelTransition);
} finally {
  await browser.close();
  await server.close();
}

if (failures.length) {
  console.error(`\nReduced-motion test failed: ${failures.length} check(s).`);
  process.exit(1);
}
console.log("\nreduced motion: every animation is off and every element lands on its end state");
