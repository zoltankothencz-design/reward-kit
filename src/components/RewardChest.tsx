import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { chest as timing, easing } from "../tokens/generated";
import { useCountUp } from "../lib/useCountUp";
import { useReducedMotion } from "../lib/useReducedMotion";
import "./RewardChest.css";

export type Tier = "mini" | "minor" | "major" | "grand";
export type ChestState = "idle" | "opening" | "open" | "claimed";

export type RewardChestHandle = { play: () => void; reset: () => void };

type Props = {
  tier: Tier;
  amount: number;
  onStateChange?: (state: ChestState) => void;
  /** open as soon as it appears, and again whenever tier or amount change */
  autoPlay?: boolean;
};

// The count starts while the lid is still moving, so the two beats overlap.
const COUNT_DELAY = timing.anticipate + timing.lid * 0.5;
export const OPENING_TOTAL = COUNT_DELAY + timing.count;

// Where each coin lands, relative to the chest mouth (SVG units).
const COINS = [
  [-66, -58],
  [-40, -88],
  [-14, -66],
  [10, -96],
  [34, -68],
  [58, -86],
  [76, -46],
];

// Four-point sparkles around the chest: x, y, size.
const SPARKS = [
  [22, 40, 9],
  [168, 34, 11],
  [14, 98, 6],
  [184, 92, 7],
  [60, 14, 6],
  [138, 10, 7],
];

const RAYS = Array.from({ length: 10 }, (_, i) => i * 36);

const formatAmount = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const RewardChest = forwardRef<RewardChestHandle, Props>(function RewardChest({ tier, amount, onStateChange, autoPlay = false }, ref) {
  const [state, setState] = useState<ChestState>("idle");
  const [counting, setCounting] = useState(false);
  const reduced = useReducedMotion();
  const timers = useRef<number[]>([]);
  // Gradient ids must be unique per instance: several chests share one page.
  const uid = useId().replace(/:/g, "");
  const ref_ = (name: string) => `url(#${uid}-${name})`;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const reset = useCallback(() => {
    clearTimers();
    setCounting(false);
    setState("idle");
  }, []);

  const play = useCallback(() => {
    clearTimers();
    if (reduced) {
      setCounting(true);
      setState("open");
      return;
    }
    setCounting(false);
    setState("opening");
    timers.current = [
      window.setTimeout(() => setCounting(true), COUNT_DELAY),
      window.setTimeout(() => setState("open"), OPENING_TOTAL),
    ];
  }, [reduced]);

  useImperativeHandle(ref, () => ({ play, reset }), [play, reset]);
  useEffect(() => onStateChange?.(state), [state, onStateChange]);
  // A different reward is a different chest: start over, and open it right
  // away when asked to. One effect, so the order of the two is never in doubt.
  useEffect(() => {
    reset();
    if (autoPlay) play();
    return clearTimers;
  }, [tier, amount, autoPlay, reset, play]);

  const shown = useCountUp(amount, counting, reduced ? 0 : timing.count, easing.out);
  const isOpen = state !== "idle";

  return (
    <div className="rk-chest" data-tier={tier} data-state={state} data-open={isOpen}>
      <svg
        className="rk-chest__art"
        viewBox="0 0 200 180"
        aria-hidden="true"
        onClick={state === "idle" ? play : undefined}
      >
        <defs>
          <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="rk-stop rk-stop--wood-hi" />
            <stop offset="0.55" className="rk-stop rk-stop--wood" />
            <stop offset="1" className="rk-stop rk-stop--wood-lo" />
          </linearGradient>
          {/* metal: bright edge, base, a dark crease, base again */}
          <linearGradient id={`${uid}-goldV`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="rk-stop rk-stop--gold-hi" />
            <stop offset="0.45" className="rk-stop rk-stop--gold" />
            <stop offset="0.6" className="rk-stop rk-stop--gold-lo" />
            <stop offset="1" className="rk-stop rk-stop--gold" />
          </linearGradient>
          <linearGradient id={`${uid}-goldH`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" className="rk-stop rk-stop--gold-lo" />
            <stop offset="0.3" className="rk-stop rk-stop--gold-hi" />
            <stop offset="0.6" className="rk-stop rk-stop--gold" />
            <stop offset="1" className="rk-stop rk-stop--gold-lo" />
          </linearGradient>
          <radialGradient id={`${uid}-coin`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" className="rk-stop rk-stop--coin-hi" />
            <stop offset="0.55" className="rk-stop rk-stop--gold" />
            <stop offset="1" className="rk-stop rk-stop--gold-lo" />
          </radialGradient>
          <radialGradient id={`${uid}-gem`} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" className="rk-stop rk-stop--gem-hi" />
            <stop offset="0.5" className="rk-stop rk-stop--tier" />
            <stop offset="1" className="rk-stop rk-stop--gem-lo" />
          </radialGradient>
          <radialGradient id={`${uid}-halo`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" className="rk-stop rk-stop--tier" stopOpacity="0.75" />
            <stop offset="1" className="rk-stop rk-stop--tier" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-inner`} cx="0.5" cy="0.9" r="0.9">
            <stop offset="0" className="rk-stop rk-stop--coin-hi" />
            <stop offset="0.5" className="rk-stop rk-stop--tier" />
            <stop offset="1" className="rk-stop rk-stop--dark" />
          </radialGradient>
          <linearGradient id={`${uid}-ray`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" className="rk-stop rk-stop--tier" stopOpacity="0.9" />
            <stop offset="1" className="rk-stop rk-stop--tier" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-shine`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle className="rk-chest__halo" cx="100" cy="92" r="92" fill={ref_("halo")} />

        <g className="rk-chest__rays">
          <g className="rk-chest__rays-spin">
            {RAYS.map((angle) => (
              <polygon key={angle} points="100,96 91,0 109,0" fill={ref_("ray")} transform={`rotate(${angle} 100 96)`} />
            ))}
          </g>
        </g>

        <ellipse className="rk-chest__floor" cx="100" cy="166" rx="62" ry="7" />

        <g className="rk-chest__box">
          <rect className="rk-chest__inside" x="44" y="80" width="112" height="26" />
          <ellipse cx="100" cy="100" rx="52" ry="14" fill={ref_("inner")} className="rk-chest__glow" />

          {/* the heap of treasure inside, visible once the lid is up */}
          <g className="rk-chest__heap">
            <ellipse cx="100" cy="99" rx="50" ry="13" fill={ref_("coin")} />
            {[
              [64, 96],
              [80, 90],
              [100, 87],
              [120, 90],
              [136, 96],
              [90, 95],
              [112, 96],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="8" fill={ref_("coin")} className="rk-chest__stroke" />
                <circle cx={x} cy={y} r="4.6" className="rk-chest__coin-ring" />
              </g>
            ))}
          </g>

          {COINS.map(([dx, dy], i) => (
            <g
              key={i}
              className="rk-chest__coin"
              style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, "--i": i } as CSSProperties}
            >
              <circle cx="100" cy="94" r="8" fill={ref_("coin")} className="rk-chest__stroke" />
              <circle cx="100" cy="94" r="4.8" className="rk-chest__coin-ring" />
            </g>
          ))}

          <g className="rk-chest__body">
            <rect x="40" y="98" width="120" height="66" rx="6" fill={ref_("wood")} />
            {/* plank seams */}
            <path className="rk-chest__seam" d="M40 120 H160 M40 142 H160" />
            <rect x="40" y="98" width="120" height="66" rx="6" className="rk-chest__vignette" />
            <rect x="40" y="98" width="120" height="10" fill={ref_("goldV")} />
            <rect x="40" y="154" width="120" height="10" rx="3" fill={ref_("goldV")} />
            <rect x="54" y="98" width="13" height="66" fill={ref_("goldH")} />
            <rect x="133" y="98" width="13" height="66" fill={ref_("goldH")} />
            {[
              [60.5, 114],
              [60.5, 146],
              [139.5, 114],
              [139.5, 146],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="3.2" className="rk-chest__stud" />
                <circle cx={x - 1} cy={y - 1} r="1" className="rk-chest__spec" />
              </g>
            ))}
            {/* lock plate and gem */}
            <rect x="86" y="101" width="28" height="32" rx="5" fill={ref_("goldH")} className="rk-chest__stroke" />
            <circle className="rk-chest__gem-glow" cx="100" cy="116" r="11" fill={ref_("halo")} />
            <circle cx="100" cy="116" r="7" fill={ref_("gem")} className="rk-chest__stroke" />
            <circle cx="97.6" cy="113.6" r="2" className="rk-chest__spec" />
            <path className="rk-chest__keyhole" d="M100 124 v5" />
          </g>

          <g className="rk-chest__lid">
            <path d="M36 100 V76 Q36 48 66 48 H134 Q164 48 164 76 V100 Z" fill={ref_("wood")} />
            <path className="rk-chest__seam" d="M40 70 Q100 56 160 70" />
            <path d="M44 74 Q44 55 68 54 H132 Q150 55 154 66 Q100 52 44 74 Z" fill={ref_("shine")} className="rk-chest__lid-shine" />
            <rect x="36" y="90" width="128" height="10" fill={ref_("goldV")} />
            <path d="M54 100 V50 Q59 48 66 48 H67 V100 Z" fill={ref_("goldH")} />
            <path d="M133 100 V48 H134 Q141 48 146 50 V100 Z" fill={ref_("goldH")} />
            <path d="M36 76 Q36 48 66 48 H134 Q164 48 164 76" className="rk-chest__lid-edge" />
          </g>
        </g>

        <g className="rk-chest__sparks">
          {SPARKS.map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <path
                className="rk-chest__spark"
                style={{ "--i": i } as CSSProperties}
                d="M0 -1 L0.2 -0.2 L1 0 L0.2 0.2 L0 1 L-0.2 0.2 L-1 0 L-0.2 -0.2 Z"
              />
            </g>
          ))}
        </g>
      </svg>

      <p className="rk-chest__tier">{tier}</p>
      <p className="rk-chest__amount" aria-hidden="true">
        {formatAmount(shown)}
      </p>
      <p className="rk-sr-only" aria-live="polite">
        {state === "open" ? `${tier} reward: ${formatAmount(amount)} coins` : ""}
      </p>

      <div className="rk-chest__action">
        {state === "idle" && (
          <button className="rk-button" onClick={play}>
            Open
          </button>
        )}
        {state === "open" && (
          <button className="rk-button" onClick={() => setState("claimed")}>
            Collect
          </button>
        )}
        {state === "claimed" && (
          <button className="rk-button rk-button--quiet" onClick={reset}>
            Collected. Reset
          </button>
        )}
      </div>
    </div>
  );
});
