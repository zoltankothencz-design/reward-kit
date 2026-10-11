import { useState } from "react";
import type { DayResult } from "../lib/economy";
import { formatCoins } from "../lib/economy";

const W = 640;
const H = 260;
const M = { top: 16, right: 16, bottom: 30, left: 52 };
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** Round a maximum up to 1, 2 or 5 times a power of ten, so the axis ends on a clean number. */
function niceCeil(value: number) {
  if (value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * pow >= value)!;
  return step * pow;
}

// Wallet balance at the end of each day. One series, so the title names it
// and there is no legend. Days with a purchase get a marker.
export function BalanceChart({ days }: { days: DayResult[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const top = niceCeil(Math.max(...days.map((d) => d.balance)));
  const x = (i: number) => M.left + (i / Math.max(days.length - 1, 1)) * (W - M.left - M.right);
  const y = (v: number) => M.top + (1 - v / top) * (H - M.top - M.bottom);
  const line = days.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.balance).toFixed(1)}`).join(" ");
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  const xTicks = days.filter((d) => d.day === 1 || d.day % 7 === 0);
  const active = hover === null ? null : days[hover];

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((px - M.left) / (W - M.left - M.right)) * (days.length - 1));
    setHover(Math.min(days.length - 1, Math.max(0, i)));
  };

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Wallet balance at the end of each day for ${days.length} days. Full numbers are in the table below.`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {yTicks.map((t) => (
          <g key={t}>
            <line className="chart__grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
            <text className="chart__tick" x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">
              {compact.format(t)}
            </text>
          </g>
        ))}
        {xTicks.map((d) => (
          <text key={d.day} className="chart__tick" x={x(d.day - 1)} y={H - 8} textAnchor="middle">
            Day {d.day}
          </text>
        ))}
        <line className="chart__axis" x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} />

        <path className="chart__line" d={line} />
        {days.map((d, i) => d.purchases > 0 && <circle key={d.day} className="chart__buy" cx={x(i)} cy={y(d.balance)} r="5" />)}

        {active && hover !== null && (
          <g>
            <line className="chart__cross" x1={x(hover)} x2={x(hover)} y1={M.top} y2={y(0)} />
            <circle className="chart__point" cx={x(hover)} cy={y(active.balance)} r="5" />
          </g>
        )}
      </svg>

      {active && hover !== null && (
        <div className="chart__tip" style={{ left: `${(x(hover) / W) * 100}%` }} data-flip={hover > days.length / 2}>
          <strong>Day {active.day}</strong>
          <span>Balance {formatCoins(active.balance)}</span>
          <span>Free +{formatCoins(active.streakCoins + active.levelCoins)}</span>
          <span>Lost −{formatCoins(active.lost)}</span>
          {active.purchases > 0 && <span>Bought +{formatCoins(active.purchasedCoins)}</span>}
          {active.spins < active.plannedSpins && <span>Ran dry after {formatCoins(active.spins)} spins</span>}
        </div>
      )}
    </div>
  );
}
