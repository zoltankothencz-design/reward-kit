import { useState } from "react";
import { LevelBar } from "../components/LevelBar";
import { RewardChest } from "../components/RewardChest";
import { WEEKLY_CHALLENGE } from "../lib/economy";
import { TemplateShell } from "./TemplateShell";

// Template: weekly challenge.
// Brief: Weekly challenge: spin 50 times this week to open a chest. Show the progress, and let the player start the next week after collecting.
// Primitives: LevelBar as the goal meter (badge = week number, bar = spins so
// far out of the goal) and RewardChest for the payoff.
// Rule: reaching the goal opens the week's chest; collecting it lets the
// player start the next week with an empty bar.
export function WeeklyChallenge() {
  const [week, setWeek] = useState(1);
  const [spins, setSpins] = useState(35);
  const [collected, setCollected] = useState(false);

  const { goal, reward } = WEEKLY_CHALLENGE;
  const done = spins >= goal;
  const spin = (count: number) => setSpins((s) => Math.min(goal, s + count));

  const nextWeek = () => {
    setWeek((w) => w + 1);
    setSpins(0);
    setCollected(false);
  };

  return (
    <TemplateShell title="Weekly challenge" intro={`Spin ${goal} times this week to open the weekly chest.`}>
      <LevelBar level={week} xp={spins} max={goal} unit="spins" badgeLabel="Week" snap={spins === 0} />

      <div className="rk-template__stage">
        {done ? (
          <RewardChest tier="major" amount={reward} autoPlay onStateChange={(state) => setCollected(state === "claimed")} />
        ) : (
          <p className="rk-template__hint">{goal - spins} spins to go.</p>
        )}
      </div>

      <div className="rk-template__row">
        {!done && (
          <>
            <button className="rk-button" onClick={() => spin(5)}>
              Spin 5 times
            </button>
            <button className="rk-button rk-button--quiet" onClick={() => spin(goal)}>
              Finish the week
            </button>
          </>
        )}
        {done && collected && (
          <button className="rk-button" onClick={nextWeek}>
            Start week {week + 1}
          </button>
        )}
      </div>
    </TemplateShell>
  );
}
