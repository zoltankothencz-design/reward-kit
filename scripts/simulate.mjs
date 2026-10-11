// Prints how a crowd of simulated players fares in a made-up slot.
//   npm run simulate
//   npm run simulate -- --bet 5 --spins 500 --start 100 --players 50000 --seed 7
// Compare it with the expected-value model on the Economy tab: that one gives
// the average, this one shows the spread around it. See the README.
import { DEFAULTS, ILLUSTRATIVE_GAME, simulate } from "../src/lib/montecarlo.mjs";

const args = process.argv.slice(2);
const options = { ...DEFAULTS };
for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace(/^--/, "");
  const value = Number(args[i + 1]);
  if (!(key in DEFAULTS) || !Number.isFinite(value) || value <= 0) {
    console.error(`usage: npm run simulate -- [--bet n] [--spins n] [--start n] [--players n] [--seed n]\nbad option: ${args[i]} ${args[i + 1] ?? ""}`);
    process.exit(1);
  }
  options[key] = value;
}

const r = simulate({ ...options });
const eur = (n) => `EUR ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

console.log(`Made-up game, RTP ${pct(r.rtp)}. Prizes (x bet): ${ILLUSTRATIVE_GAME.map((p) => `${p.multiplier}x at ${(p.chance * 100).toFixed(2)}%`).join(", ")}.`);
console.log(`Bet ${eur(options.bet)}, up to ${options.spins} spins, start ${eur(options.start)}, ${options.players.toLocaleString("en-US")} simulated players (seed ${options.seed}).\n`);

console.log("Expected-value model (the average, as on the Economy tab)");
console.log(`  wagered ${eur(r.wagered)}, average loss ${eur(r.wagered * (1 - r.rtp))}, expected end balance ${eur(r.expectedEnd)}\n`);

console.log("Monte Carlo (how the players are spread)");
console.log(`  ran out of money before the last spin   ${pct(r.ranDryShare)}`);
console.log(`  average spins actually played           ${r.averageSpinsPlayed.toFixed(0)} of ${options.spins}`);
console.log(`  finished above the starting balance     ${pct(r.aboveStartShare)}`);
console.log(`  hit the top prize (${eur(r.biggestPrize)})           ${pct(r.hitBiggestShare)}`);
console.log(`  end balance: 5% ${eur(r.percentiles.p5)} | 25% ${eur(r.percentiles.p25)} | median ${eur(r.percentiles.median)} | 75% ${eur(r.percentiles.p75)} | 95% ${eur(r.percentiles.p95)} | best ${eur(r.percentiles.max)}`);
console.log(`  mean end balance ${eur(r.meanEnd)} (differs from the expected ${eur(r.expectedEnd)} because a player who runs out cannot lose more)`);
