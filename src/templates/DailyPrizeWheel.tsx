import { useState } from "react";
import { PrizeWheel } from "../components/PrizeWheel";
import { RewardChest } from "../components/RewardChest";
import { WHEEL_PRIZES, formatCoins, pickWheelPrize } from "../lib/economy";
import { TemplateShell } from "./TemplateShell";

const SEGMENTS = WHEEL_PRIZES.map((p) => ({ label: formatCoins(p.amount), tier: p.tier }));

// Template: daily prize wheel. Built only from primitives (PrizeWheel and
// RewardChest). The connecting rule: the prize is picked with pickWheelPrize
// before the player spins, and the first time the wheel lands, that prize
// opens its chest. Any landing after the first is ignored, so a day pays once.
export function DailyPrizeWheel() {
  const [round, setRound] = useState(0);
  const [landOn, setLandOn] = useState(() => pickWheelPrize(Math.random()));
  const [won, setWon] = useState<number | null>(null);

  const onLanded = (index: number) => {
    setWon((current) => (current === null ? index : current));
  };

  const nextDay = () => {
    setLandOn(pickWheelPrize(Math.random()));
    setWon(null);
    setRound((r) => r + 1);
  };

  return (
    <TemplateShell title="Daily prize wheel" intro="Spin the wheel once a day and collect the prize it lands on.">
      <div className="rk-template__pair">
        <PrizeWheel key={round} segments={SEGMENTS} landOn={landOn} onLanded={onLanded} />

        <div className="rk-template__stage">
          {won !== null ? (
            <RewardChest tier={WHEEL_PRIZES[won].tier} amount={WHEEL_PRIZES[won].amount} autoPlay />
          ) : (
            <p className="rk-template__hint">Spin the wheel to win today's prize.</p>
          )}
        </div>
      </div>

      <button className="rk-button rk-button--quiet" onClick={nextDay}>
        Next day (restart demo)
      </button>
    </TemplateShell>
  );
}
