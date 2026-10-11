// Demo numbers shared by the primitives and templates. Phase 3 replaces this
// with a real, adjustable reward economy.

/** XP needed to go from `level` to `level + 1`. Grows 20% per level. */
export const xpForLevel = (level: number) => Math.round(100 * 1.2 ** (level - 1));

/** Coins for each of the seven daily-streak days. Day 7 is the bonus day. */
export const DAILY_REWARDS = [500, 750, 1_000, 1_500, 2_500, 4_000, 12_500] as const;

export const formatCoins = (n: number) => new Intl.NumberFormat("en-US").format(n);
