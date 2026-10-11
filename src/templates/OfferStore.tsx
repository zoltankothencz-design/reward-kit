import { useState } from "react";
import { OfferCard } from "../components/OfferCard";
import { PACKS, bestValuePack, packCoins } from "../lib/economy";
import "./templates.css";

// Template: coin store. The packs and their prices come from the economy
// module, so the badges are computed, not typed: "Best value" goes to the
// pack with the most coins per dollar. Demo only: no payments exist anywhere in this project.
export function OfferStore() {
  const [bought, setBought] = useState<string[]>([]);
  const best = bestValuePack();

  return (
    <section className="rk-template rk-store" aria-labelledby="store-title">
      <header className="rk-template__head">
        <h3 id="store-title">Coin store</h3>
        <p>Demo only. Nothing is charged.</p>
      </header>

      <div className="rk-store__grid">
        {PACKS.map((pack) => (
          <OfferCard
            key={pack.id}
            name={pack.name}
            coins={packCoins(pack)}
            bonus={pack.bonus || undefined}
            price={`$${pack.price.toFixed(2)}`}
            badge={pack.id === best.id ? "Best value" : pack.featured ? "Most popular" : undefined}
            featured={pack.featured}
            endsInSeconds={pack.featured ? 3 * 3600 - 1 : undefined}
            onBuy={() => setBought((b) => [...b, pack.name])}
          />
        ))}
      </div>

      <p className="rk-template__hint" aria-live="polite">
        {bought.length ? `In your cart (demo): ${bought.join(", ")}` : "Pick an offer."}
      </p>
    </section>
  );
}
