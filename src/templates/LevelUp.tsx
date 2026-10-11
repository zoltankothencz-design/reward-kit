import { useState } from "react";
import { LevelBar } from "../components/LevelBar";
import { RewardChest } from "../components/RewardChest";
import type { Tier } from "../components/RewardChest";
import { levelReward } from "../lib/economy";
import { useLevelProgress } from "../lib/useLevelProgress";
import { TemplateShell } from "./TemplateShell";

type LevelReward = { level: number; amount: number; tier: Tier };

// Template: progression screen. A LevelBar plus the rule that every new
// level pays a chest. Gaining enough XP for several levels pays the highest.
export function LevelUp() {
  const [reward, setReward] = useState<LevelReward | null>(null);

  const { level, xp, snap, gain } = useLevelProgress(3, 60, (newLevel) =>
    setReward({ level: newLevel, amount: levelReward(newLevel), tier: newLevel % 5 === 0 ? "major" : "minor" }),
  );

  return (
    <TemplateShell title="Level up" intro="Every new level pays a chest.">
      <LevelBar level={level} xp={xp} snap={snap} />

      <div className="rk-template__row">
        <button className="rk-button" onClick={() => gain(40)}>
          +40 XP
        </button>
        <button className="rk-button" onClick={() => gain(120)}>
          +120 XP
        </button>
        <button className="rk-button rk-button--quiet" onClick={() => gain(400)}>
          +400 XP (several levels)
        </button>
      </div>

      {reward ? (
        <div className="rk-template__stack">
          <h4>Level {reward.level} reached</h4>
          <RewardChest tier={reward.tier} amount={reward.amount} autoPlay />
          <button className="rk-button rk-button--quiet" onClick={() => setReward(null)}>
            Continue
          </button>
        </div>
      ) : (
        <p className="rk-template__hint">Add XP to reach the next level.</p>
      )}
    </TemplateShell>
  );
}
