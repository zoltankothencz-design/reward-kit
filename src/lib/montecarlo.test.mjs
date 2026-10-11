import { describe, expect, it } from "vitest";
import { DEFAULTS, ILLUSTRATIVE_GAME, rtpOf, seededRandom, simulate } from "./montecarlo.mjs";

describe("Monte Carlo player simulation", () => {
  it("the illustrative game pays back exactly 95%", () => {
    expect(rtpOf(ILLUSTRATIVE_GAME)).toBeCloseTo(0.95, 10);
  });

  it("the same seed gives the same result, a different seed a different one", () => {
    const a = simulate({ ...DEFAULTS, players: 2000 });
    expect(simulate({ ...DEFAULTS, players: 2000 })).toEqual(a);
    expect(simulate({ ...DEFAULTS, players: 2000, seed: 99 }).meanEnd).not.toBe(a.meanEnd);
  });

  it("the random generator stays between 0 and 1", () => {
    const random = seededRandom(1);
    for (let i = 0; i < 10_000; i++) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("with a bottomless wallet the average end balance matches the expected-value maths", () => {
    // start so high nobody can run out: the model and the simulation must agree
    const r = simulate({ ...DEFAULTS, start: 1_000_000, players: 20000 });
    expect(r.ranDryShare).toBe(0);
    expect(Math.abs(r.meanEnd - r.expectedEnd)).toBeLessThan(15); // sampling noise of a heavy-tailed game
  });

  it("with a normal wallet most players run dry although the expected balance is positive", () => {
    const r = simulate({ ...DEFAULTS });
    expect(r.expectedEnd).toBeGreaterThan(0);
    expect(r.ranDryShare).toBeGreaterThan(0.5);
    expect(r.percentiles.median).toBeLessThan(DEFAULTS.bet);
  });
});
