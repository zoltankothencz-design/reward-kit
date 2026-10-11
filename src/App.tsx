import { useEffect, useState } from "react";
import { Gallery } from "./pages/Gallery";
import { MotionSpec } from "./pages/MotionSpec";
import { Economy } from "./pages/Economy";
import { TEMPLATES } from "./templates";
import { brands } from "./tokens/generated";
import type { BrandId } from "./tokens/generated";
import "./App.css";
import "./pages/pages.css";

const TABS = [
  { id: "gallery", label: "Gallery", intro: `Five primitives and ${TEMPLATES.length} templates, all themed by the brand switch.` },
  { id: "motion", label: "Motion spec", intro: "Durations, curves and the beat-by-beat timing of every primitive." },
  { id: "economy", label: "Economy", intro: "The numbers behind the rewards: does a month of play hold together?" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const tabFromHash = (): TabId => TABS.find((t) => `#${t.id}` === window.location.hash)?.id ?? "gallery";

export default function App() {
  const [brand, setBrand] = useState<BrandId>("aurum");
  const [tab, setTab] = useState<TabId>(tabFromHash);

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="rk-surface page" data-brand={brand}>
      <div className="toolbar">
        <div className="toolbar__inner">
          <nav className="rk-segmented" aria-label="Pages">
            {TABS.map((t) => (
              <button
                key={t.id}
                aria-pressed={t.id === tab}
                onClick={() => {
                  window.location.hash = t.id;
                  window.scrollTo(0, 0);
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="toolbar__brand">
            <span className="field__label">Brand</span>
            <div className="rk-segmented">
              {brands.map((b) => (
                <button key={b.id} aria-pressed={b.id === brand} onClick={() => setBrand(b.id)}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <header className="page__header">
        <h1>Reward Kit</h1>
        <p>{active.intro}</p>
      </header>

      <main>
        {tab === "gallery" && <Gallery brand={brand} />}
        {tab === "motion" && <MotionSpec />}
        {tab === "economy" && <Economy />}
      </main>
    </div>
  );
}
