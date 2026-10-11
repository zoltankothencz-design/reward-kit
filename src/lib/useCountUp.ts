import { useEffect, useState } from "react";
import { cubicBezier } from "./bezier";

type Curve = readonly [number, number, number, number];

// Counts from 0 to `target` while `running` is true. With durationMs 0
// (reduced motion) it shows the final value at once.
export function useCountUp(target: number, running: boolean, durationMs: number, curve: Curve) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!running) {
      setValue(0);
      return;
    }
    if (durationMs <= 0) {
      setValue(target);
      return;
    }
    const ease = cubicBezier(...curve);
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * ease(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, running, durationMs, curve]);

  return value;
}
