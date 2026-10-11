import { useEffect, useRef, useState } from "react";
import { xpForLevel } from "../lib/economy";
import "./LevelBar.css";

type Props = {
  level: number;
  xp: number;
  /** true for one render when the bar must jump without animating (new level, empty bar) */
  snap?: boolean;
};

export function LevelBar({ level, xp, snap = false }: Props) {
  const max = xpForLevel(level);
  const progress = Math.min(xp / max, 1);

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
        <span className="rk-level__label">Level</span>
        <span className="rk-level__num">{level}</span>
      </div>
      <div className="rk-level__body">
        <div
          className="rk-level__track"
          role="progressbar"
          aria-label={`Progress to level ${level + 1}`}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={xp}
        >
          <div className="rk-level__fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="rk-level__xp">
          {xp} / {max} XP
        </p>
      </div>
    </div>
  );
}
