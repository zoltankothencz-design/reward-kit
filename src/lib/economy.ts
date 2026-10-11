/* @helper
name: economy
use: Every reward number. Import from here instead of typing amounts: xpForLevel(level), levelReward(level), DAILY_REWARDS (seven daily amounts), WEEKLY_CHALLENGE (goal and reward), COMEBACK (chest and one-off offer), vipPoints(pack) with vipTierName(tier) and vipTierReward(tier), PACKS with packCoins(pack) and bestValuePack(), formatCoins(n).
rules: If a mechanic needs a new reward amount, add it here as a named constant or function with a comment, never inline in a template.
*/
// The reward economy: every number the primitives and templates show comes
// from here, and `simulate` plays a player through a month to show whether
// the numbers hold together.
//
// It is an EXPECTED-VALUE model: every spin loses exactly bet x (1 - RTP).
// Real slot results swing widely around that average, so real players run dry
// earlier or later than this says. Use it to compare settings, not to predict
// one player.

/** XP needed to go from `level` to `level + 1`. Grows 20% per level. */
export const xpForLevel = (level: number) => Math.round(100 * 1.2 ** (level - 1));

/** Coins paid for reaching `level`. */
export const levelReward = (level: number) => level * 500;

/** Coins for each of the seven daily-streak days. Day 7 is the bonus day. */
export const DAILY_REWARDS = [500, 750, 1_000, 1_500, 2_500, 4_000, 12_500] as const;

/** Weekly challenge: spins needed in a week, and the coins its chest pays.
 *  5,000 is two days of the bigger daily rewards: worth a week of play, small next to the day-7 bonus. */
export const WEEKLY_CHALLENGE = { goal: 50, reward: 5_000 } as const;

/** Comeback bonus for a player back after DAYS_AWAY days: a free chest, plus one coin offer open for OFFER_MINUTES.
 *  The chest (3,000) is about what four daily rewards pay, so it feels like the missed days handed back.
 *  The offer is 5,000 base coins at the Starter price with +100% bonus, so it is clearly the best deal in the
 *  store, which is why it is rare and short. It is kept out of PACKS so the store and the simulation are unchanged. */
export const COMEBACK = {
  daysAway: 7,
  chestCoins: 3_000,
  offerMinutes: 30,
  offer: { name: "Welcome back pack", price: 1.99, baseCoins: 5_000, bonus: 100 },
} as const;

export const formatCoins = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

// --- store ----------------------------------------------------------------

export type Pack = {
  id: string;
  name: string;
  price: number;
  /** coins before the bonus */
  baseCoins: number;
  /** extra coins in percent of baseCoins */
  bonus: number;
  featured?: boolean;
};

// Base rate is about 2,500 coins per dollar. Bigger packs add a bonus on top,
// so the bonus label on a card is a real number, not decoration.
export const PACKS: Pack[] = [
  { id: "starter", name: "Starter", price: 1.99, baseCoins: 5_000, bonus: 0 },
  { id: "lucky", name: "Lucky bundle", price: 7.99, baseCoins: 20_000, bonus: 50, featured: true },
  { id: "mega", name: "Mega vault", price: 29.99, baseCoins: 75_000, bonus: 100 },
];

export const packCoins = (p: Pack) => Math.round(p.baseCoins * (1 + p.bonus / 100));
export const coinsPerDollar = (p: Pack) => packCoins(p) / p.price;
/** The pack that gives the most coins per dollar. */
export const bestValuePack = (packs: Pack[] = PACKS) =>
  packs.reduce((best, p) => (coinsPerDollar(p) > coinsPerDollar(best) ? p : best));

// --- VIP ladder ---------------------------------------------------------------

/** VIP points earned per dollar spent on a pack: $1.99 gives 20, $29.99 gives 300. */
export const VIP_POINTS_PER_DOLLAR = 10;

/** VIP points a pack earns. */
export const vipPoints = (p: Pack) => Math.round(p.price * VIP_POINTS_PER_DOLLAR);

/** Names of the VIP tiers, lowest first. Tier 1 is the first entry. */
export const VIP_TIER_NAMES = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"] as const;

/** Name for a VIP tier number; tiers past the list keep the top name. */
export const vipTierName = (tier: number) => VIP_TIER_NAMES[Math.min(tier, VIP_TIER_NAMES.length) - 1];

/** Coins paid for reaching VIP `tier`. 5x the level reward: tiers cost real money, levels are free. */
export const vipTierReward = (tier: number) => tier * 2_500;

// --- simulation -------------------------------------------------------------

export type EconomyInput = {
  bet: number;
  spinsPerSession: number;
  sessionsPerDay: number;
  /** return to player, 0 to 1 (0.95 = the game pays back 95% of what is bet) */
  rtp: number;
  /** XP earned per 1,000 coins bet */
  xpPer1000: number;
  startBalance: number;
  startLevel: number;
  days: number;
  /** id of the pack the player buys whenever they cannot afford a spin; null = never buys */
  buysPack: string | null;
};

export type DayResult = {
  day: number;
  streakCoins: number;
  levelCoins: number;
  levelUps: number;
  plannedSpins: number;
  spins: number;
  lost: number;
  purchases: number;
  purchasedCoins: number;
  spent: number;
  /** balance at the end of the day */
  balance: number;
  level: number;
};

export type EconomyResult = {
  days: DayResult[];
  /** first day (1-based) the player could not finish their planned play, or bought a pack; null if never */
  firstDryDay: number | null;
  totalFree: number;
  totalLost: number;
  totalSpent: number;
  totalPurchases: number;
  /** share of the planned spins the player could actually afford, 0 to 1 */
  playShare: number;
  /** free coins as a share of what the planned play costs, from a run with a bottomless wallet */
  freeCoverage: number;
  /** average coins lost per day when all planned spins are played (same bottomless run) */
  costPerDay: number;
  /** average free coins per day when all planned spins are played (same bottomless run) */
  freePerDay: number;
};

const PURCHASE_CAP_PER_DAY = 50; // stops a runaway loop if a pack cannot fund a single spin

function run(input: EconomyInput, bottomless: boolean) {
  const edge = 1 - input.rtp;
  const pack = PACKS.find((p) => p.id === input.buysPack) ?? null;
  const plannedSpins = Math.max(0, Math.round(input.spinsPerSession * input.sessionsPerDay));
  let balance = input.startBalance;
  let level = input.startLevel;
  let xp = 0;
  const days: DayResult[] = [];

  for (let d = 0; d < input.days; d++) {
    const streakCoins = DAILY_REWARDS[d % DAILY_REWARDS.length];
    balance += streakCoins;
    const day: DayResult = {
      day: d + 1, streakCoins, levelCoins: 0, levelUps: 0, plannedSpins,
      spins: 0, lost: 0, purchases: 0, purchasedCoins: 0, spent: 0, balance: 0, level,
    };

    for (let s = 0; s < plannedSpins; s++) {
      if (!bottomless && balance < input.bet) {
        if (!pack || day.purchases >= PURCHASE_CAP_PER_DAY) break;
        balance += packCoins(pack);
        day.purchases += 1;
        day.purchasedCoins += packCoins(pack);
        day.spent += pack.price;
        if (balance < input.bet) break;
      }
      const loss = input.bet * edge;
      balance -= loss;
      day.lost += loss;
      day.spins += 1;
      xp += (input.bet * input.xpPer1000) / 1000;
      while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level += 1;
        balance += levelReward(level);
        day.levelCoins += levelReward(level);
        day.levelUps += 1;
      }
    }
    day.balance = balance;
    day.level = level;
    days.push(day);
  }
  return days;
}

const sum = (days: DayResult[], pick: (d: DayResult) => number) => days.reduce((t, d) => t + pick(d), 0);

export function simulate(input: EconomyInput): EconomyResult {
  const days = run(input, false);
  const reference = run(input, true);

  const planned = sum(days, (d) => d.plannedSpins);
  const referenceLost = sum(reference, (d) => d.lost);
  const referenceFree = sum(reference, (d) => d.streakCoins + d.levelCoins);
  const dry = days.find((d) => d.spins < d.plannedSpins || d.purchases > 0);

  return {
    days,
    firstDryDay: dry ? dry.day : null,
    totalFree: sum(days, (d) => d.streakCoins + d.levelCoins),
    totalLost: sum(days, (d) => d.lost),
    totalSpent: sum(days, (d) => d.spent),
    totalPurchases: sum(days, (d) => d.purchases),
    playShare: planned ? sum(days, (d) => d.spins) / planned : 1,
    freeCoverage: referenceLost > 0 ? referenceFree / referenceLost : Infinity,
    costPerDay: input.days ? referenceLost / input.days : 0,
    freePerDay: input.days ? referenceFree / input.days : 0,
  };
}

export const DEFAULT_ECONOMY: EconomyInput = {
  bet: 250,
  spinsPerSession: 200,
  sessionsPerDay: 3,
  rtp: 0.95,
  xpPer1000: 1,
  startBalance: 20_000,
  startLevel: 3,
  days: 30,
  buysPack: null,
};
