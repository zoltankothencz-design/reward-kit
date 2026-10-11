import { useState } from "react";
import { DEFAULTS, ILLUSTRATIVE_GAME, simulate } from "../lib/montecarlo.mjs";
import type { SimulationResult } from "../lib/montecarlo.mjs";

const BETS = [1, 2, 5];
const STARTS = [100, 200, 500];
const SPINS = 1000;
const PLAYERS = 20_000;

const eur = (n: number) => `€${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${(n * 100).toFixed(n < 0.1 ? 1 : 0)}%`;

export function MonteCarlo() {
  const [bet, setBet] = useState(DEFAULTS.bet);
  const [start, setStart] = useState(DEFAULTS.start);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ r: SimulationResult; bet: number; start: number; seed: number } | null>(null);

  const run = () => {
    setRunning(true);
    // Let the button repaint as "Running" before the page is busy for a moment.
    window.setTimeout(() => {
      const r = simulate({ bet, spins: SPINS, start, players: PLAYERS, seed });
      setResult({ r, bet, start, seed });
      setSeed(seed + 1);
      setRunning(false);
    }, 30);
  };

  const shown = result?.r;
  const biggest = Math.max(...(shown?.buckets.map((b) => b.share) ?? [1]));

  return (
    <section aria-labelledby="mc-title" className="mc">
      <h2 id="mc-title">Beyond the average: 20,000 players</h2>
      <p className="muted">
        The model above gives an average. This plays {PLAYERS.toLocaleString("en-US")} random players through {SPINS.toLocaleString("en-US")} spins
        of a made-up slot that pays back 95% ({ILLUSTRATIVE_GAME.map((p) => `${p.multiplier}× at ${(p.chance * 100).toFixed(2)}%`).join(", ")}),
        and shows how they end up. The prize table is invented, so read it as an illustration of why an average is not enough, not as a
        statement about a real game. This is a Monte Carlo simulation: play it out many times with random numbers and look at the spread.
      </p>

      <div className="mc__controls">
        <label className="field">
          <span className="field__label">Bet per spin</span>
          <select value={bet} onChange={(e) => setBet(Number(e.target.value))}>
            {BETS.map((b) => (
              <option key={b} value={b}>
                €{b}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Starting balance</span>
          <select value={start} onChange={(e) => setStart(Number(e.target.value))}>
            {STARTS.map((s) => (
              <option key={s} value={s}>
                €{s}
              </option>
            ))}
          </select>
        </label>
        <button className="rk-button" onClick={run} disabled={running}>
          {running ? "Running" : result ? "Run again (new seed)" : `Play ${PLAYERS.toLocaleString("en-US")} players`}
        </button>
      </div>

      {shown && result && (
        <div className="mc__results" aria-live="polite">
          <div className="tiles">
            <div className="tile">
              <span className="tile__label">The average says</span>
              <span className="tile__value">{eur(shown.expectedEnd)}</span>
              <span className="tile__note">
                left of {eur(result.start)} after {eur(shown.wagered)} wagered
              </span>
            </div>
            <div className="tile">
              <span className="tile__label">In reality</span>
              <span className="tile__value">{pct(shown.ranDryShare)}</span>
              <span className="tile__note">ran out of money, after {Math.round(shown.averageSpinsPlayed)} of {SPINS} spins on average</span>
            </div>
            <div className="tile">
              <span className="tile__label">Median player ends with</span>
              <span className="tile__value">{eur(shown.percentiles.median)}</span>
              <span className="tile__note">
                best of {PLAYERS.toLocaleString("en-US")}: {eur(shown.percentiles.max)}
              </span>
            </div>
          </div>

          <h3>Where the players ended up</h3>
          <ul className="mc__bars">
            {shown.buckets.map((b) => (
              <li key={b.label} className="mc__bar">
                <span className="mc__bar-label">{b.label}</span>
                <span className="mc__bar-track" aria-hidden="true">
                  <span className="mc__bar-fill" style={{ width: `${(b.share / biggest) * 100}%` }} />
                </span>
                <span className="mc__bar-value">{pct(b.share)}</span>
              </li>
            ))}
          </ul>

          <p className="muted">
            {pct(shown.aboveStartShare)} finish above their starting {eur(result.start)}, and {pct(shown.hitBiggestShare)} hit the top prize (
            {eur(shown.biggestPrize)}). The simulated mean is {eur(shown.meanEnd)}, not {eur(shown.expectedEnd)}: a player who runs out cannot
            lose any more, which lifts the mean. Seed {result.seed}, so the same settings give the same numbers. The command line version is{" "}
            <code>npm run simulate</code>.
          </p>
        </div>
      )}
    </section>
  );
}
