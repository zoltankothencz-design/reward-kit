/* @primitive
name: DailyStreak
use: A row of rewards for consecutive days, with today marked and past days checked off.
not: Progress that is not day by day (use LevelBar).
rules: It holds no state of its own about days: pass claimed (how many days are collected) and canClaim (is today still waiting), and update them in onClaim. The last day is shown as the bonus day. Use DAILY_REWARDS from the economy helper for the amounts.
example: <DailyStreak rewards={DAILY_REWARDS} claimed={3} canClaim onClaim={(day) => {}} />
*/
import { useState } from "react";
import { Coin } from "./Coin";
import { formatCoins } from "../lib/economy";
import "./DailyStreak.css";

type Props = {
  rewards: readonly number[];
  /** how many days are already collected (0 to rewards.length) */
  claimed: number;
  /** is today's reward still waiting? */
  canClaim: boolean;
  onClaim: (dayIndex: number) => void;
};

export function DailyStreak({ rewards, claimed, canClaim, onClaim }: Props) {
  // Only the tile collected in this session draws its check mark; tiles that
  // were already collected on load show it finished.
  const [fresh, setFresh] = useState<number | null>(null);
  const allDone = claimed >= rewards.length;
  const today = canClaim && !allDone ? claimed : -1;

  const claim = () => {
    if (today < 0) return;
    setFresh(today);
    onClaim(today);
  };

  return (
    <div className="rk-streak">
      <ol className="rk-streak__days">
        {rewards.map((coins, i) => {
          const state = i < claimed ? "claimed" : i === today ? "today" : "upcoming";
          const last = i === rewards.length - 1;
          return (
            <li key={i} className="rk-streak__tile" data-state={state} data-last={last}>
              <span className="rk-streak__day">Day {i + 1}</span>
              <Coin size={last ? 40 : 32} />
              <span className="rk-streak__coins">{formatCoins(coins)}</span>
              {last && <span className="rk-streak__bonus">Bonus</span>}
              {state === "claimed" && (
                <span className="rk-streak__check" data-fresh={fresh === i} aria-label="Collected">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <button className="rk-button rk-streak__claim" onClick={claim} disabled={today < 0}>
        {allDone ? "Streak complete" : today < 0 ? "Come back tomorrow" : `Collect day ${today + 1}`}
      </button>
    </div>
  );
}
