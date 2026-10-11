import { useId } from "react";
import "./Coin.css";

// The shared coin icon. Colours come from the brand's gold shades.
export function Coin({ size = 24 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <span className="rk-coin" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-c`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" className="rk-stop rk-stop--coin-hi" />
            <stop offset="0.55" className="rk-stop rk-stop--gold" />
            <stop offset="1" className="rk-stop rk-stop--gold-lo" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="10.5" fill={`url(#${uid}-c)`} className="rk-coin__rim" />
        <circle cx="12" cy="12" r="6.8" className="rk-coin__ring" />
        <polygon
          className="rk-coin__star"
          points="12,8.2 13.1,10.7 15.8,11 13.8,12.8 14.4,15.5 12,14.1 9.6,15.5 10.2,12.8 8.2,11 10.9,10.7"
        />
      </svg>
    </span>
  );
}
