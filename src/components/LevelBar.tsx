/* @primitive
name: LevelBar
use: Progress toward a threshold, with the current step in a round badge. By default it shows a level and its XP. With max, unit and badgeLabel it shows any goal, for example 7 of 10 spins in a weekly challenge.
not: Time left (OfferCard has the countdown), a wallet balance, or a reward amount.
rules: It never moves by itself; it draws the numbers it is given. When the badge number changes, the badge pops. Pass snap for the one render where the bar must jump to empty without animating. For level and XP, use the useLevelProgress helper, which produces level, xp and snap for you.
example: <LevelBar level={4} xp={60} />
example: <LevelBar level={2} xp={7} max={10} unit="spins" badgeLabel="Week" />
*/
import { useEffect, useRef, useState } from "react";
import { xpForLevel } from "../lib/economy";
import "./LevelBar.css";

type Props = {
  /** the number in the badge */
  level: number;
  /** progress so far */
  xp: number;
  /** the threshold; defaults to the XP the level curve asks for at this level */
  max?: number;
  /** word after the numbers, default "XP" */
  unit?: string;
  /** small word above the badge number, default "Level" */
  badgeLabel?: string;
  /** true for one render when the bar must jump without animating (new level, empty bar) */
  snap?: boolean;
};

export function LevelBar({ level, xp, max = xpForLevel(level), unit = "XP", badgeLabel = "Level", snap = false }: Props) {
  const progress = max > 0 ? Math.min(Math.max(xp / max, 0), 1) : 0;

  // Count level changes so the badge can replay its pop. The first render
  // does not pop.
  const previous = useRef(level);
  const [pops, setPops] = useState(0);
  useEffect(() => {
    if (level !== previous.current) setPops((n) => n + 1);
    previous.current = level;
  }, [level]);

  return (
    <div className="rk-level" data-snap={snap}>
      <div className="rk-level__badge" key={pops} data-pop={pops > 0}>
        <span className="rk-level__label">{badgeLabel}</span>
        <span className="rk-level__num">{level}</span>
      </div>
      <div className="rk-level__body">
        <div
          className="rk-level__track"
          role="progressbar"
          aria-label={`${badgeLabel} ${level}: ${xp} of ${max} ${unit}`}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={xp}
        >
          <div className="rk-level__fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="rk-level__xp">
          {xp} / {max} {unit}
        </p>
      </div>
    </div>
  );
}
