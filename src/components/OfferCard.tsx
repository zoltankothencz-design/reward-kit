/* @primitive
name: OfferCard
use: Something the player can buy: a coin pack or a bundle, with its price on the button.
not: Free rewards (use RewardChest) or progress (use LevelBar).
rules: The anatomy is fixed: badge, name, coins, bonus, price button, timer. Empty rows keep their height, so cards in a row line up. At most one featured card per row. Take name, coins, bonus and price from PACKS in the economy helper so the numbers stay true; do not type amounts by hand. endsInSeconds adds a live countdown and disables the button at zero.
example: <OfferCard name="Starter" coins={5000} price="$1.99" onBuy={() => {}} />
*/
import { useEffect, useRef, useState } from "react";
import { Coin } from "./Coin";
import { useCountdown } from "../lib/useCountdown";
import { formatCoins } from "../lib/economy";
import "./OfferCard.css";

type Props = {
  name: string;
  coins: number;
  /** extra coins in percent, shown as "+50% bonus" */
  bonus?: number;
  price: string;
  badge?: string;
  featured?: boolean;
  /** show a live countdown that starts at this many seconds */
  endsInSeconds?: number;
  onBuy?: () => void;
};

export function OfferCard({ name, coins, bonus, price, badge, featured, endsInSeconds, onBuy }: Props) {
  const timer = useCountdown(endsInSeconds ?? 0);
  const expired = endsInSeconds !== undefined && timer.expired;
  const [bought, setBought] = useState(false);
  const reset = useRef<number>(0);
  useEffect(() => () => clearTimeout(reset.current), []);

  const buy = () => {
    if (expired || bought) return;
    setBought(true);
    onBuy?.();
    reset.current = window.setTimeout(() => setBought(false), 1800);
  };

  return (
    <article className="rk-offer" data-featured={featured} data-bought={bought} data-expired={expired}>
      {badge && <span className="rk-offer__badge">{badge}</span>}
      <h3 className="rk-offer__name">{name}</h3>

      <div className="rk-offer__icon" aria-hidden="true">
        <Coin size={36} />
        <Coin size={52} />
        <Coin size={36} />
      </div>

      <p className="rk-offer__coins">{formatCoins(coins)}</p>
      <p className="rk-offer__unit">coins</p>
      <p className="rk-offer__bonus">{bonus ? `+${bonus}% bonus` : " "}</p>

      <button className="rk-button rk-offer__buy" onClick={buy} disabled={expired}>
        {expired ? "Expired" : bought ? "Added" : price}
      </button>
      <p className="rk-offer__timer">{endsInSeconds !== undefined ? (expired ? "Offer ended" : `Ends in ${timer.label}`) : " "}</p>
    </article>
  );
}
