import { describe, expect, it } from "vitest";
import {
  DAILY_REWARDS,
  WHEEL_PRIZES,
  pickWheelPrize,
  wheelExpectedValue,
  DEFAULT_ECONOMY,
  PACKS,
  bestValuePack,
  coinsPerDollar,
  levelReward,
  packCoins,
  simulate,
  xpForLevel,
} from "./economy";
import type { EconomyInput } from "./economy";

const base: EconomyInput = { ...DEFAULT_ECONOMY };
const total = (r: ReturnType<typeof simulate>, key: "streakCoins" | "levelCoins" | "purchasedCoins" | "lost") =>
  r.days.reduce((t, d) => t + d[key], 0);

describe("level curve", () => {
  it("matches hand-computed thresholds", () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(3)).toBe(144);
    expect(xpForLevel(12)).toBe(743);
    expect(levelReward(5)).toBe(2_500);
  });
});

describe("store", () => {
  it("pays the bonus on top of the base coins", () => {
    expect(PACKS.map(packCoins)).toEqual([5_000, 30_000, 150_000]);
  });
  it("gets cheaper per coin as packs grow, so the biggest pack is the best value", () => {
    const rates = PACKS.map(coinsPerDollar);
    expect(rates[0]).toBeLessThan(rates[1]);
    expect(rates[1]).toBeLessThan(rates[2]);
    expect(bestValuePack().id).toBe("mega");
  });
});

describe("simulate", () => {
  it("conserves coins: end = start + free + bought - lost", () => {
    for (const buysPack of [null, "starter", "mega"]) {
      const r = simulate({ ...base, buysPack });
      const end = r.days[r.days.length - 1].balance;
      const expected =
        base.startBalance + total(r, "streakCoins") + total(r, "levelCoins") + total(r, "purchasedCoins") - total(r, "lost");
      expect(end).toBeCloseTo(expected, 6);
    }
  });

  it("never lets the balance go below zero", () => {
    for (const buysPack of [null, "lucky"]) {
      const r = simulate({ ...base, buysPack });
      expect(Math.min(...r.days.map((d) => d.balance))).toBeGreaterThanOrEqual(0);
    }
  });

  it("with a 100% RTP nothing is lost and the player never runs dry", () => {
    const r = simulate({ ...base, rtp: 1 });
    expect(r.totalLost).toBe(0);
    expect(r.firstDryDay).toBeNull();
    expect(r.playShare).toBe(1);
    expect(r.freeCoverage).toBe(Infinity);
  });

  it("matches a case small enough to work out by hand", () => {
    // No XP, so only the streak pays. Day 1: 1,000 + 500 = 1,500 coins.
    // Each spin costs 100 x 10% = 10 coins, and a spin needs 100 in the wallet.
    // 100 planned spins cost 1,000, leaving 500. Day 2: +750 = 1,250, minus 1,000 = 250.
    // Day 3: +1,000 = 1,250, minus 1,000 = 250.
    const r = simulate({
      bet: 100, spinsPerSession: 100, sessionsPerDay: 1, rtp: 0.9, xpPer1000: 0,
      startBalance: 1_000, startLevel: 1, days: 3, buysPack: null,
    });
    expect(r.days.map((d) => Math.round(d.balance))).toEqual([500, 250, 250]);
    expect(r.firstDryDay).toBeNull();
    // free coins 2,250 against 3,000 lost
    expect(r.freeCoverage).toBeCloseTo(0.75, 6);
    expect(r.costPerDay).toBeCloseTo(1_000, 6);
    expect(r.freePerDay).toBeCloseTo(750, 6);
  });

  it("stops a non-buyer who cannot afford a spin, and counts the first dry day", () => {
    // 150 coins, bet 100, lose 50 a spin: spin 1 leaves 100, spin 2 leaves 50, then stuck.
    const r = simulate({
      bet: 100, spinsPerSession: 10, sessionsPerDay: 1, rtp: 0.5, xpPer1000: 0,
      startBalance: 150 - DAILY_REWARDS[0], startLevel: 1, days: 1, buysPack: null,
    });
    expect(r.days[0].spins).toBe(2);
    expect(r.days[0].balance).toBeCloseTo(50, 6);
    expect(r.firstDryDay).toBe(1);
    expect(r.playShare).toBeCloseTo(0.2, 6);
  });

  it("a buyer refills instead of stopping, and the spend is counted", () => {
    const dry = simulate({ ...base, buysPack: null });
    const buyer = simulate({ ...base, buysPack: "starter" });
    expect(dry.playShare).toBeLessThan(1);
    expect(buyer.playShare).toBe(1);
    expect(buyer.totalPurchases).toBeGreaterThan(0);
    expect(buyer.totalSpent).toBeCloseTo(buyer.totalPurchases * 1.99, 6);
    expect(buyer.firstDryDay).toBe(dry.firstDryDay);
  });

  it("pays level rewards for every level crossed", () => {
    // 1,000 XP per spin from level 1: far more than one level per spin.
    const r = simulate({
      bet: 1_000, spinsPerSession: 1, sessionsPerDay: 1, rtp: 1, xpPer1000: 1_000,
      startBalance: 1_000, startLevel: 1, days: 1, buysPack: null,
    });
    // 100 + 120 + 144 + 173 + 207 + 249 = 993 XP crosses six levels (1 to 7); 7 XP are left over
    expect(r.days[0].level).toBe(7);
    expect(r.days[0].levelCoins).toBe(levelReward(2) + levelReward(3) + levelReward(4) + levelReward(5) + levelReward(6) + levelReward(7));
  });
});

describe("prize wheel", () => {
  it("chances sum to 100 and neighbouring slices differ in tier", () => {
    expect(WHEEL_PRIZES.reduce((t, p) => t + p.weight, 0)).toBe(100);
    WHEEL_PRIZES.forEach((p, i) => expect(p.tier).not.toBe(WHEEL_PRIZES[(i + 1) % WHEEL_PRIZES.length].tier));
  });
  it("maps rolls to slices, first and last included", () => {
    expect(pickWheelPrize(0)).toBe(0);
    expect(pickWheelPrize(0.239)).toBe(0);
    expect(pickWheelPrize(0.24)).toBe(1);
    expect(pickWheelPrize(0.999)).toBe(7);
  });
  it("pays between 1,000 and 2,000 coins a spin on average", () => {
    expect(wheelExpectedValue()).toBeGreaterThan(1_000);
    expect(wheelExpectedValue()).toBeLessThan(2_000);
  });
});
