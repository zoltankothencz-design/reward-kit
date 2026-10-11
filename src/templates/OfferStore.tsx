import { useState } from "react";
import { OfferCard } from "../components/OfferCard";
import "./templates.css";

// Template: coin store. Three offers of the same primitive; the middle one is
// the featured deal. Demo only: no payments exist anywhere in this project.
export function OfferStore() {
  const [bought, setBought] = useState<string[]>([]);

  return (
    <section className="rk-template rk-store" aria-labelledby="store-title">
      <header className="rk-template__head">
        <h3 id="store-title">Coin store</h3>
        <p>Demo only. Nothing is charged.</p>
      </header>

      <div className="rk-store__grid">
        <OfferCard name="Starter" coins={5_000} price="$1.99" onBuy={() => setBought((b) => [...b, "Starter"])} />
        <OfferCard
          name="Lucky bundle"
          coins={25_000}
          bonus={50}
          price="$7.99"
          badge="Best value"
          featured
          endsInSeconds={3 * 3600 - 1}
          onBuy={() => setBought((b) => [...b, "Lucky bundle"])}
        />
        <OfferCard name="Mega vault" coins={120_000} bonus={100} price="$29.99" onBuy={() => setBought((b) => [...b, "Mega vault"])} />
      </div>

      <p className="rk-template__hint" aria-live="polite">
        {bought.length ? `In your cart (demo): ${bought.join(", ")}` : "Pick an offer."}
      </p>
    </section>
  );
}
