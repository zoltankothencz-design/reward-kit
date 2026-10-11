import { useMemo, useState } from "react";
import { BalanceChart } from "./BalanceChart";
import { MonteCarlo } from "./MonteCarlo";
import { DEFAULT_ECONOMY, PACKS, bestValuePack, coinsPerDollar, formatCoins, packCoins, simulate } from "../lib/economy";
import type { EconomyInput } from "../lib/economy";

type NumericKey = "bet" | "spinsPerSession" | "sessionsPerDay" | "xpPer1000" | "startBalance" | "startLevel";

const SLIDERS: { key: NumericKey; label: string; min: number; max: number; step: number; hint: string }[] = [
  { key: "bet", label: "Bet per spin", min: 50, max: 2000, step: 50, hint: "coins" },
  { key: "spinsPerSession", label: "Spins per session", min: 50, max: 500, step: 10, hint: "spins" },
  { key: "sessionsPerDay", label: "Sessions per day", min: 1, max: 6, step: 1, hint: "sessions" },
  { key: "xpPer1000", label: "XP per 1,000 coins bet", min: 0, max: 5, step: 0.5, hint: "XP" },
  { key: "startBalance", label: "Welcome balance", min: 0, max: 200_000, step: 5_000, hint: "coins" },
  { key: "startLevel", label: "Starting level", min: 1, max: 30, step: 1, hint: "" },
];

const percent = (v: number) => (Number.isFinite(v) ? `${Math.round(v * 100)}%` : "all");

// Rule of thumb used on this page only. It is a starting point for a
// discussion, not an industry benchmark.
function verdict(exact: number) {
  // Judge the same rounded figure the tile shows, so the two never disagree.
  const coverage = Math.round(exact * 100) / 100;
  if (coverage >= 1) return { label: "Too generous", text: "Free coins pay for all of the planned play. Nobody needs the store." };
  if (coverage >= 0.6) return { label: "Balanced", text: "Free coins pay for most of the play. The store shortens the wait." };
  return { label: "Tight", text: "Free coins pay for less than 60% of the play. Players who never buy run dry fast." };
}

export function Economy() {
  const [input, setInput] = useState<EconomyInput>(DEFAULT_ECONOMY);
  const result = useMemo(() => simulate(input), [input]);
  const set = <K extends keyof EconomyInput>(key: K, value: EconomyInput[K]) => setInput((i) => ({ ...i, [key]: value }));

  const edge = 1 - input.rtp;
  const plannedSpins = input.spinsPerSession * input.sessionsPerDay;
  const dailyCost = input.bet * plannedSpins * edge;
  const v = verdict(result.freeCoverage);
  const starterRate = coinsPerDollar(PACKS[0]);
  const best = bestValuePack();
  const last = result.days[result.days.length - 1];

  return (
    <>
      <section aria-labelledby="eco-title">
        <h2 id="eco-title">Reward economy</h2>
        <p className="muted">
          Do the rewards and prices hold together? This plays one player through {input.days} days with the same numbers the chest, the
          streak, the level bar and the store use.
        </p>
        <p className="muted">
          It is an average-case model: every spin loses exactly bet × (1 − RTP). Real results swing widely, so real players run dry
          earlier or later. Use it to compare settings, not to predict one player.
        </p>
      </section>

      <section className="eco" aria-label="Simulation">
        <form className="eco__controls" onSubmit={(e) => e.preventDefault()}>
          {SLIDERS.map((s) => (
            <label className="eco__field" key={s.key}>
              <span className="eco__label">
                {s.label}
                <output>
                  {formatCoins(input[s.key])} {s.hint}
                </output>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={input[s.key]}
                onChange={(e) => set(s.key, Number(e.target.value))}
              />
            </label>
          ))}
          <label className="eco__field">
            <span className="eco__label">
              Game pays back (RTP)
              <output>{(input.rtp * 100).toFixed(1)}%</output>
            </span>
            <input
              type="range"
              min={85}
              max={99}
              step={0.5}
              value={input.rtp * 100}
              onChange={(e) => set("rtp", Number(e.target.value) / 100)}
            />
          </label>
          <label className="eco__field">
            <span className="eco__label">When the wallet is empty</span>
            <select value={input.buysPack ?? ""} onChange={(e) => set("buysPack", e.target.value || null)}>
              <option value="">Never buys, waits for tomorrow</option>
              {PACKS.map((p) => (
                <option key={p.id} value={p.id}>
                  Buys {p.name} (${p.price.toFixed(2)})
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="rk-button rk-button--quiet" onClick={() => setInput(DEFAULT_ECONOMY)}>
            Reset
          </button>
        </form>

        <div className="eco__results">
          <div className="tiles">
            <div className="tile">
              <span className="tile__label">Free coins cover</span>
              <span className="tile__value">{percent(result.freeCoverage)}</span>
              <span className="tile__note">of what the planned play costs</span>
            </div>
            <div className="tile">
              <span className="tile__label">Wallet first runs dry</span>
              <span className="tile__value">{result.firstDryDay ? `Day ${result.firstDryDay}` : "Never"}</span>
              <span className="tile__note">within {input.days} days</span>
            </div>
            {input.buysPack ? (
              <div className="tile">
                <span className="tile__label">Spent in {input.days} days</span>
                <span className="tile__value">${result.totalSpent.toFixed(2)}</span>
                <span className="tile__note">
                  {result.totalPurchases} {result.totalPurchases === 1 ? "purchase" : "purchases"}
                </span>
              </div>
            ) : (
              <div className="tile">
                <span className="tile__label">Play they can afford</span>
                <span className="tile__value">{percent(result.playShare)}</span>
                <span className="tile__note">of the planned spins, without buying</span>
              </div>
            )}
          </div>

          <p className="eco__verdict">
            <strong>{v.label}.</strong> {v.text} A full day of planned play costs {formatCoins(result.costPerDay)} coins on average,
            and streak and level rewards return {formatCoins(result.freePerDay)} of that. In this run the player ends on level{" "}
            {last.level}.
          </p>

          <h3>Wallet balance at the end of each day</h3>
          <BalanceChart days={result.days} />
          {input.buysPack && <p className="muted chart__note">Dots mark days with a purchase.</p>}

          <details className="eco__table">
            <summary>Show the numbers for every day</summary>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Streak</th>
                    <th>Level rewards</th>
                    <th>Spins</th>
                    <th>Lost</th>
                    <th>Bought</th>
                    <th>Balance</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {result.days.map((d) => (
                    <tr key={d.day}>
                      <th scope="row">{d.day}</th>
                      <td className="num">{formatCoins(d.streakCoins)}</td>
                      <td className="num">{formatCoins(d.levelCoins)}</td>
                      <td className="num">
                        {formatCoins(d.spins)} / {formatCoins(d.plannedSpins)}
                      </td>
                      <td className="num">{formatCoins(d.lost)}</td>
                      <td className="num">{d.purchases ? formatCoins(d.purchasedCoins) : "0"}</td>
                      <td className="num">{formatCoins(d.balance)}</td>
                      <td className="num">{d.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      <MonteCarlo />

      <section aria-labelledby="store-math">
        <h3 id="store-math">Store maths</h3>
        <p className="muted">
          The cards in the coin store read these packs. "Best value" is computed: it goes to {best.name}, the pack with the most coins
          per dollar.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Pack</th>
                <th>Price</th>
                <th>Base coins</th>
                <th>Bonus</th>
                <th>Coins you get</th>
                <th>Coins per $</th>
                <th>Versus Starter</th>
                <th>Planned play it funds</th>
              </tr>
            </thead>
            <tbody>
              {PACKS.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.name}</th>
                  <td className="num">${p.price.toFixed(2)}</td>
                  <td className="num">{formatCoins(p.baseCoins)}</td>
                  <td className="num">{p.bonus ? `+${p.bonus}%` : "none"}</td>
                  <td className="num">{formatCoins(packCoins(p))}</td>
                  <td className="num">{formatCoins(coinsPerDollar(p))}</td>
                  <td className="num">{p.id === PACKS[0].id ? "base" : `+${Math.round((coinsPerDollar(p) / starterRate - 1) * 100)}%`}</td>
                  <td className="num">{dailyCost > 0 ? `${(packCoins(p) / dailyCost).toFixed(1)} days` : "no cost"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">
          "Planned play it funds" is the pack divided by the average daily cost, before any free coins. Demo prices; nothing in this
          project takes payments.
        </p>
      </section>
    </>
  );
}
