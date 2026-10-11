import { useState } from "react";
import { LevelBar } from "../components/LevelBar";
import { OfferCard } from "../components/OfferCard";
import { RewardChest } from "../components/RewardChest";
import type { Tier } from "../components/RewardChest";
import { PACKS, formatCoins, packCoins, vipPoints, vipTierName, vipTierReward } from "../lib/economy";
import { useLevelProgress } from "../lib/useLevelProgress";
import { TemplateShell } from "./TemplateShell";

type TierReward = { tier: number; amount: number; chest: Tier };

// Template: VIP ladder. Uses LevelBar (the VIP tier in its badge and the
// points toward the next tier), OfferCard (the coin packs) and RewardChest
// (the tier payout). The one rule: buying a pack adds its VIP points, and
// every VIP tier crossed pays a chest. Buying a big pack can cross several
// tiers; the highest one is shown. Demo only: no payments exist here.
function Ladder({ onReset }: { onReset: () => void }) {
  const [reward, setReward] = useState<TierReward | null>(null);

  const { level, xp, snap, gain } = useLevelProgress(1, 0, (tier) =>
    setReward({ tier, amount: vipTierReward(tier), chest: tier >= 4 ? "major" : "minor" }),
  );

  return (
    <TemplateShell title="VIP ladder" intro="Every pack you buy earns VIP points. Every new tier pays a chest.">
      <LevelBar level={level} xp={xp} snap={snap} unit="VIP points" badgeLabel="VIP" />
      <p className="rk-template__hint" aria-live="polite">
        Your tier: {vipTierName(level)}
      </p>

      <div className="rk-template__stage">
        {reward ? (
          <div className="rk-template__stack">
            <h4>
              VIP {vipTierName(reward.tier)} reached: {formatCoins(reward.amount)} coins
            </h4>
            <RewardChest tier={reward.chest} amount={reward.amount} autoPlay />
            <button className="rk-button rk-button--quiet" onClick={() => setReward(null)}>
              Continue
            </button>
          </div>
        ) : (
          <p className="rk-template__hint">Buy a pack to climb the ladder.</p>
        )}
      </div>

      <div className="rk-template__grid">
        {PACKS.map((pack) => (
          <OfferCard
            key={pack.id}
            name={pack.name}
            coins={packCoins(pack)}
            bonus={pack.bonus || undefined}
            price={`$${pack.price.toFixed(2)}`}
            badge={`+${vipPoints(pack)} VIP`}
            featured={pack.featured}
            onBuy={() => gain(vipPoints(pack))}
          />
        ))}
      </div>

      <div className="rk-template__row">
        <button className="rk-button rk-button--quiet" onClick={onReset}>
          Start over
        </button>
      </div>
    </TemplateShell>
  );
}

export function VipLadder() {
  // A new key remounts the ladder, which starts the demo over.
  const [run, setRun] = useState(0);
  return <Ladder key={run} onReset={() => setRun((r) => r + 1)} />;
}
