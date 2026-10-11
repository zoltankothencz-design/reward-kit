import { useCallback, useEffect, useRef, useState } from "react";
import { level as timing } from "../tokens/generated";
import { xpForLevel } from "./economy";

type View = { level: number; xp: number; snap: boolean };
type Step = View & { at: number; levelUp: boolean };

// Owns level and XP, and plays a gain as a sequence the level bar can show:
// fill to the end, jump to the next level with the bar empty (snap, no
// transition), then fill the remainder. One gain can cross several levels.
export function useLevelProgress(initialLevel: number, initialXp: number, onLevelUp?: (level: number) => void) {
  const [view, setView] = useState<View>({ level: initialLevel, xp: initialXp, snap: false });
  const current = useRef({ level: initialLevel, xp: initialXp });
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const levelUpRef = useRef(onLevelUp);
  levelUpRef.current = onLevelUp;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const gain = useCallback((amount: number) => {
    if (busy.current || amount <= 0) return;
    busy.current = true;

    const steps: Step[] = [];
    let { level, xp } = current.current;
    let remaining = amount;
    let at = 0;
    while (remaining > 0) {
      const need = xpForLevel(level) - xp;
      if (remaining < need) {
        steps.push({ at, level, xp: xp + remaining, snap: false, levelUp: false });
        xp += remaining;
        remaining = 0;
      } else {
        steps.push({ at, level, xp: xpForLevel(level), snap: false, levelUp: false });
        at += timing.fill + 40;
        level += 1;
        xp = 0;
        remaining -= need;
        steps.push({ at, level, xp: 0, snap: true, levelUp: true });
        at += 60; // one frame with transitions on again before the next fill
      }
    }
    current.current = { level, xp };

    steps.forEach((step) => {
      timers.current.push(
        window.setTimeout(() => {
          setView({ level: step.level, xp: step.xp, snap: step.snap });
          if (step.levelUp) levelUpRef.current?.(step.level);
        }, step.at),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        busy.current = false;
      }, at + timing.fill),
    );
  }, []);

  return { ...view, gain };
}
