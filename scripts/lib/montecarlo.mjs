// Monte Carlo player simulation: many random players, each spinning a made-up
// slot until the spins or the money run out. The expected-value model on the
// Economy tab gives the average; this shows how the players are spread around it.
//
// The game below is made up for illustration. It is NOT a real game: a real
// one needs the manufacturer's prize distribution.

/** Prizes as a multiple of the bet, with their chance. Everything else pays nothing. */
export const ILLUSTRATIVE_GAME = [
  { multiplier: 2, chance: 0.2 },
  { multiplier: 5, chance: 0.06 },
  { multiplier: 25, chance: 0.008 },
  { multiplier: 500, chance: 0.0001 },
];

/** Return to player of a prize table: the average pay per unit bet. */
export const rtpOf = (game) => game.reduce((total, { multiplier, chance }) => total + multiplier * chance, 0);

/** A small seeded random generator, so a run can be repeated exactly. */
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export const DEFAULTS = { bet: 2, spins: 1000, start: 200, players: 20000, seed: 12345 };

/**
 * Plays `players` players through `spins` spins each. A player who cannot
 * afford a bet stops. Returns the spread of end balances and a few shares.
 */
export function simulate({ game = ILLUSTRATIVE_GAME, bet, spins, start, players, seed }) {
  const random = seededRandom(seed);
  const spin = () => {
    const roll = random();
    let edge = 0;
    for (const { multiplier, chance } of game) {
      edge += chance;
      if (roll < edge) return multiplier;
    }
    return 0;
  };
  const biggest = Math.max(...game.map((p) => p.multiplier));

  const ends = [];
  let ranDry = 0;
  let aboveStart = 0;
  let hitBiggest = 0;
  let spinsPlayed = 0;
  for (let i = 0; i < players; i++) {
    let balance = start;
    let hit = false;
    for (let s = 0; s < spins; s++) {
      if (balance < bet) break;
      balance -= bet;
      spinsPlayed++;
      const multiplier = spin();
      if (multiplier === biggest) hit = true;
      balance += multiplier * bet;
    }
    if (balance < bet) ranDry++;
    if (balance > start) aboveStart++;
    if (hit) hitBiggest++;
    ends.push(balance);
  }
  ends.sort((a, b) => a - b);
  const at = (q) => ends[Math.floor(q * (players - 1))];
  const rtp = rtpOf(game);
  return {
    rtp,
    wagered: spins * bet,
    expectedEnd: start - spins * bet * (1 - rtp),
    meanEnd: ends.reduce((t, e) => t + e, 0) / players,
    percentiles: { p5: at(0.05), p25: at(0.25), median: at(0.5), p75: at(0.75), p95: at(0.95), max: ends[players - 1] },
    ranDryShare: ranDry / players,
    aboveStartShare: aboveStart / players,
    hitBiggestShare: hitBiggest / players,
    averageSpinsPlayed: spinsPlayed / players,
    biggestPrize: biggest * bet,
  };
}
