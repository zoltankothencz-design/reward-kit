import { useState } from "react";
import { OfferCard } from "../components/OfferCard";
import { RewardChest } from "../components/RewardChest";
import { COMEBACK, packCoins } from "../lib/economy";
import { TemplateShell } from "./TemplateShell";

// Template: comeback bonus.
// Brief: Comeback bonus: a player returns after a week away. Welcome them back with a chest they can open, and beside it one special coin offer that expires in 30 minutes.
// Primitives: RewardChest (the free welcome-back gift, tapped open by the
// player) and OfferCard (the one special coin offer, with its live countdown).
// Rule: coming back after a week away shows both together and starts the
// offer's 30-minute clock at that moment, so the free gift and the paid
// deal share one welcome and the deal is time-limited from the first second.
// Demo only: no payments exist anywhere in this project.
export function ComebackBonus() {
  const [returned, setReturned] = useState(false);
  const [bought, setBought] = useState(false);
  // Changes on every return, so the offer is a fresh card with a fresh clock.
  const [visit, setVisit] = useState(0);

  const pack = { id: "comeback", ...COMEBACK.offer };

  const comeBack = () => {
    setVisit((v) => v + 1);
    setBought(false);
    setReturned(true);
  };

  const restart = () => {
    setReturned(false);
    setBought(false);
  };

  return (
    <TemplateShell
      title="Welcome back!"
      intro={`You have been away ${COMEBACK.daysAway} days. Open your gift, and grab the welcome-back offer before it ends.`}
    >
      {returned ? (
        <div className="rk-template__pair">
          <div className="rk-template__stage">
            <RewardChest key={`chest-${visit}`} tier="minor" amount={COMEBACK.chestCoins} />
          </div>
          <OfferCard
            key={`offer-${visit}`}
            name={pack.name}
            coins={packCoins(pack)}
            bonus={pack.bonus}
            price={`$${pack.price.toFixed(2)}`}
            badge="Welcome back"
            featured
            endsInSeconds={COMEBACK.offerMinutes * 60}
            onBuy={() => setBought(true)}
          />
        </div>
      ) : (
        <div className="rk-template__stage">
          <p className="rk-template__hint">Your gift and offer appear when the player comes back.</p>
        </div>
      )}

      <p className="rk-template__hint" aria-live="polite">
        {bought ? `In your cart (demo): ${pack.name}` : returned ? "The offer is open for a short time only." : " "}
      </p>

      <div className="rk-template__row">
        {returned ? (
          <button className="rk-button rk-button--quiet" onClick={restart}>
            Start over
          </button>
        ) : (
          <button className="rk-button" onClick={comeBack}>
            Player returns after {COMEBACK.daysAway} days
          </button>
        )}
      </div>
    </TemplateShell>
  );
}
