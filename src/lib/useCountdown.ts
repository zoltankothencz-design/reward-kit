/* @helper
name: useCountdown
use: const { label, expired } = useCountdown(seconds) gives a ticking "H:MM:SS" label. OfferCard already uses it through endsInSeconds; reach for it directly only for a deadline that is not on an offer.
*/
import { useEffect, useState } from "react";

// Counts down from `seconds` once per second and returns a "H:MM:SS" label.
export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const h = Math.floor(left / 3600);
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return { left, label: `${h}:${m}:${s}`, expired: left === 0 };
}
