import { useState } from "react";
import { DailyStreak } from "../components/DailyStreak";
import { RewardChest } from "../components/RewardChest";
import type { Tier } from "../components/RewardChest";
import { DAILY_REWARDS } from "../lib/economy";
import { TemplateShell } from "./TemplateShell";

const TIER_BY_DAY: Tier[] = ["mini", "mini", "minor", "minor", "major", "major", "grand"];

// Template: daily bonus screen. Built only from primitives (DailyStreak and
// RewardChest); it owns the rule that connects them: collecting a day opens
// that day's chest.
export function DailyBonus() {
  const [claimed, setClaimed] = useState(3);
  const [canClaim, setCanClaim] = useState(true);
  const [reward, setReward] = useState<{ day: number; amount: number } | null>(null);

  const onClaim = (day: number) => {
    setClaimed(day + 1);
    setCanClaim(false);
    setReward({ day, amount: DAILY_REWARDS[day] });
  };

  const restart = () => {
    setClaimed(3);
    setCanClaim(true);
    setReward(null);
  };

  return (
    <TemplateShell title="Daily bonus" intro="Collect every day to keep your streak and reach the bonus chest.">
      <DailyStreak rewards={DAILY_REWARDS} claimed={claimed} canClaim={canClaim} onClaim={onClaim} />

      <div className="rk-template__stage">
        {reward ? (
          <RewardChest tier={TIER_BY_DAY[reward.day]} amount={reward.amount} autoPlay />
        ) : (
          <p className="rk-template__hint">Collect today's reward to open its chest.</p>
        )}
      </div>

      <button className="rk-button rk-button--quiet" onClick={restart}>
        Restart demo
      </button>
    </TemplateShell>
  );
}
