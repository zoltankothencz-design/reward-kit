/* @primitive
name: PrizeWheel
use: A wheel of prizes the player spins once. It lands on the slice the parent chose, then reports it.
not: A reward reveal on its own (that is RewardChest), or a way to decide the result. The wheel never picks the prize; it only shows the one it is told to land on.
rules: Pass 2 to 12 segments, each with a short label and a tier that sets the slice colour (rising order mini, minor, major, grand). landOn is the index of the winning segment and must be set before the player taps Spin; pick it with the economy helper pickWheelPrize, never inside the wheel or the template. onLanded(index) fires when the wheel has stopped, so give the reward from there. After a spin, change landOn for the next one. With reduced motion the wheel is on the winning slice at once. For a limit such as one spin a day, pass lockedLabel (for example "Come back tomorrow") once the spin is used: the button then shows that text, is disabled, and the wheel will not spin.
example: <PrizeWheel segments={WHEEL_PRIZES.map((p) => ({ label: formatCoins(p.amount), tier: p.tier }))} landOn={3} onLanded={(i) => grant(WHEEL_PRIZES[i].amount)} />
*/
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { wheel as timing } from "../tokens/generated";
import { useReducedMotion } from "../lib/useReducedMotion";
import "./PrizeWheel.css";

export type WheelTier = "mini" | "minor" | "major" | "grand";
export type WheelState = "idle" | "spinning" | "landed";
export type PrizeWheelHandle = { spin: () => void };

type Props = {
  /** 2 to 12 slices, clockwise from the top */
  segments: { label: string; tier: WheelTier }[];
  /** index of the winning segment, set before the player spins */
  landOn: number;
  /** fires when the wheel has stopped, with the winning index */
  onLanded?: (index: number) => void;
  /** when set, spinning is refused and the button shows this text instead, for example "Come back tomorrow" */
  lockedLabel?: string;
};

const CX = 100;
const CY = 110;
const R = 86;
const FULL_TURNS = 5;

const point = (deg: number, radius: number) => {
  const a = (deg * Math.PI) / 180;
  return [CX + radius * Math.sin(a), CY - radius * Math.cos(a)];
};
const slice = (from: number, to: number) => {
  const [x1, y1] = point(from, R);
  const [x2, y2] = point(to, R);
  return `M${CX} ${CY} L${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
};

/** The next resting angle: whole turns on top of where it is now, ending with the centre of `index` under the pointer. */
export const restingAngle = (current: number, index: number, count: number) => {
  const size = 360 / count;
  const target = (360 - (index + 0.5) * size) % 360;
  return Math.floor(current / 360) * 360 + FULL_TURNS * 360 + target;
};

export const PrizeWheel = forwardRef<PrizeWheelHandle, Props>(function PrizeWheel({ segments, landOn, onLanded, lockedLabel }, ref) {
  const [state, setState] = useState<WheelState>("idle");
  const [angle, setAngle] = useState(0);
  // The slice this spin is heading for. landOn may already point at the next prize when the wheel reports.
  const [spunTo, setSpunTo] = useState(landOn);
  const [instant, setInstant] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<number>(0);
  const uid = useId().replace(/:/g, "");
  const size = 360 / segments.length;
  const winner = segments[spunTo];

  const spin = useCallback(() => {
    if (state === "spinning" || lockedLabel) return;
    window.clearTimeout(timer.current);
    setInstant(reduced);
    setSpunTo(landOn);
    setAngle((a) => restingAngle(a, landOn, segments.length));
    if (reduced) {
      setState("landed");
      onLanded?.(landOn);
      return;
    }
    setState("spinning");
    timer.current = window.setTimeout(() => {
      setState("landed");
      onLanded?.(landOn);
    }, timing.spin);
  }, [state, lockedLabel, reduced, landOn, segments.length, onLanded]);

  useImperativeHandle(ref, () => ({ spin }), [spin]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flashFrom = spunTo * size;
  return (
    <div className="rk-wheel" data-state={state} data-instant={instant}>
      <div className="rk-wheel__stage">
        <svg className="rk-wheel__art" viewBox="0 0 200 220" aria-hidden="true">
          <defs>
            <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" className="rk-stop rk-stop--wheel-hi" />
              <stop offset="0.5" className="rk-stop rk-stop--wheel" />
              <stop offset="1" className="rk-stop rk-stop--wheel-lo" />
            </linearGradient>
            <radialGradient id={`${uid}-hub`} cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" className="rk-stop rk-stop--wheel-hi" />
              <stop offset="0.6" className="rk-stop rk-stop--wheel" />
              <stop offset="1" className="rk-stop rk-stop--wheel-lo" />
            </radialGradient>
          </defs>

          <g className="rk-wheel__rotor" style={{ "--angle": `${angle}deg` } as CSSProperties}>
            {segments.map((s, i) => (
              <path key={i} className="rk-wheel__slice" data-tier={s.tier} d={slice(i * size, (i + 1) * size)} />
            ))}
            {segments.map((s, i) => (
              <text
                key={i}
                className="rk-wheel__label"
                x={CX}
                y={CY - R * 0.66}
                transform={`rotate(${(i + 0.5) * size} ${CX} ${CY})`}
              >
                {s.label}
              </text>
            ))}
            <path className="rk-wheel__flash" d={slice(flashFrom, flashFrom + size)} />
          </g>

          <circle cx={CX} cy={CY} r={R} className="rk-wheel__rim" stroke={`url(#${uid}-rim)`} />
          <circle cx={CX} cy={CY} r={R + 5} className="rk-wheel__rim-edge" />
          <circle cx={CX} cy={CY} r="14" className="rk-wheel__hub" fill={`url(#${uid}-hub)`} />
          <polygon className="rk-wheel__pointer" points="90,2 110,2 100,32" />
        </svg>
      </div>

      <p className="rk-wheel__result" aria-live="polite">
        {state === "landed" ? `Landed on ${winner.label}` : ""}
      </p>
      <button className="rk-button" onClick={spin} disabled={state === "spinning" || !!lockedLabel}>
        {lockedLabel ?? (state === "spinning" ? "Spinning" : state === "landed" ? "Spin again" : "Spin")}
      </button>
    </div>
  );
});
