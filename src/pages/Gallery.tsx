import { useRef, useState } from "react";
import { RewardChest } from "../components/RewardChest";
import type { ChestState, RewardChestHandle, Tier } from "../components/RewardChest";
import { LevelBar } from "../components/LevelBar";
import { OfferCard } from "../components/OfferCard";
import { DailyStreak } from "../components/DailyStreak";
import { DailyBonus } from "../templates/DailyBonus";
import { OfferStore } from "../templates/OfferStore";
import { LevelUp } from "../templates/LevelUp";
import { DAILY_REWARDS } from "../lib/economy";
import { useLevelProgress } from "../lib/useLevelProgress";
import { brands } from "../tokens/generated";
import type { BrandId } from "../tokens/generated";
import "../App.css";

const TIERS: { id: Tier; amount: number }[] = [
  { id: "mini", amount: 250 },
  { id: "minor", amount: 1_000 },
  { id: "major", amount: 12_500 },
  { id: "grand", amount: 250_000 },
];

export function Gallery({ brand }: { brand: BrandId }) {
  const [tier, setTier] = useState<Tier>("major");
  const [state, setState] = useState<ChestState>("idle");
  const [streakClaimed, setStreakClaimed] = useState(2);
  const demoLevel = useLevelProgress(12, 45);
  const trio = useRef<(RewardChestHandle | null)[]>([]);

  const amount = TIERS.find((t) => t.id === tier)!.amount;
  const activeBrand = brands.find((b) => b.id === brand)!;

  return (
    <>

        <section aria-labelledby="prim-title">
          <h2 id="prim-title">Primitives</h2>
          <p className="muted">
            One component per job. {activeBrand.name}: {activeBrand.description}
          </p>

          <div className="workbench">
            <div className="workbench__stage">
              <RewardChest tier={tier} amount={amount} onStateChange={setState} />
            </div>
            <div className="workbench__panel">
              <h3>Reward chest</h3>
              <p className="muted">Opens with a squash, a lid pop, a burst and a count-up. States: idle, opening, open, claimed. Timing is on the Motion spec tab.</p>
              <div className="field">
                <span className="field__label">Reward tier</span>
                <div className="rk-segmented">
                  {TIERS.map((t) => (
                    <button key={t.id} aria-pressed={t.id === tier} onClick={() => setTier(t.id)}>
                      {t.id}
                    </button>
                  ))}
                </div>
              </div>
              <p className="muted">
                State: <strong className="state">{state}</strong>
              </p>
            </div>
          </div>

          <div className="prim-grid">
            <div className="prim-card">
              <h3>Level bar</h3>
              <p className="muted">
                The bar never moves by itself: it shows the level and XP it is given. These buttons add XP. A new level pops the badge.
              </p>
              <LevelBar level={demoLevel.level} xp={demoLevel.xp} snap={demoLevel.snap} />
              <div className="prim-card__buttons">
                <button className="rk-button" onClick={() => demoLevel.gain(25)}>
                  +25 XP
                </button>
                <button className="rk-button rk-button--quiet" onClick={() => demoLevel.gain(700)}>
                  +700 XP (level up)
                </button>
              </div>
            </div>
            <div className="prim-card">
              <h3>Offer card</h3>
              <p className="muted">Fixed anatomy. The featured variant wins by scale and a gold edge.</p>
              <div className="prim-card__offer">
                <OfferCard name="Lucky bundle" coins={30_000} bonus={50} price="$7.99" badge="Most popular" featured endsInSeconds={7_200} />
              </div>
            </div>
            <div className="prim-card prim-card--wide">
              <h3>Daily streak</h3>
              <p className="muted">Seven days. Today is marked, collected days are dimmed with a check that draws itself.</p>
              <DailyStreak
                rewards={DAILY_REWARDS}
                claimed={streakClaimed}
                canClaim={streakClaimed < DAILY_REWARDS.length}
                onClaim={(i) => setStreakClaimed(i + 1)}
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="tpl-title">
          <h2 id="tpl-title">Templates</h2>
          <p className="muted">
            A template is a screen made only of primitives plus the rule that connects them. It adds no colour, no font and no motion of its
            own; the style check fails the build if it does.
          </p>
          <div className="templates">
            <DailyBonus />
            <LevelUp />
            <OfferStore />
          </div>
        </section>

        <section aria-labelledby="trio-title">
          <div className="trio__head">
            <div>
              <h2 id="trio-title">Three brands, one motion</h2>
              <p className="muted">Same component, same timing. Only the brand tokens differ.</p>
            </div>
            <div className="trio__buttons">
              <button className="rk-button" onClick={() => trio.current.forEach((c) => c?.play())}>
                Open all three
              </button>
              <button className="rk-button rk-button--quiet" onClick={() => trio.current.forEach((c) => c?.reset())}>
                Reset
              </button>
            </div>
          </div>
          <div className="trio">
            {brands.map((b, i) => (
              <article key={b.id} className="rk-surface trio__card" data-brand={b.id}>
                <h3>{b.name}</h3>
                <RewardChest
                  ref={(el) => {
                    trio.current[i] = el;
                  }}
                  tier={tier}
                  amount={amount}
                />
              </article>
            ))}
          </div>
        </section>
    </>
  );
}
