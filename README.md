# Reward Kit

A code-first design system for reward and gamification mechanics, themed for several brands.
The brands (Aurum, Amber, Frost) are fictional. Built with Claude Code.

## Status

Phases 1 and 2 of 5 are done: design tokens, three brands, four primitives (reward chest, level bar, offer card, daily streak) and three templates (daily bonus, level up, coin store).

| Phase | Content | State |
|---|---|---|
| 1 | Tokens, three brands, reward chest | done |
| 2 | Level bar, offer card, daily streak, three templates | done |
| 3 | Motion spec page, reward economy calculator | next |
| 4 | AI skill that composes mechanics from primitives, with timing | |
| 5 | Figma library generated from the tokens | |

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:5183.

## How it is organised

- `tokens/core.json`: spacing, type scale and **motion** (durations, easing curves, the chest choreography). Shared by every brand.
- `tokens/brands/*.json`: colour, fonts and corner radius. One file per brand.
- `scripts/build-tokens.mjs`: turns the JSON into `src/styles/tokens.css` (CSS variables) and `src/tokens/generated.ts` (the same motion values for JavaScript).
- `src/components/`: the primitives. `RewardChest` (states `idle`, `opening`, `open`, `claimed`), `LevelBar`, `OfferCard`, `DailyStreak`, plus the shared `Coin` icon.
- `src/templates/`: screens made only of primitives plus the rule that connects them (`DailyBonus`, `LevelUp`, `OfferStore`).
- `scripts/check-styles.mjs`: `npm run check` fails if a component or template hard-codes a colour or a font, or if a template defines motion.

## Rules the build enforces

`npm run tokens` fails if a brand:

- misses a token another brand has, or adds one the others do not have,
- tries to override a core token (so a brand cannot change timing or easing),
- has text or tier colours below the WCAG contrast minimum.

## Adding a brand

Copy `tokens/brands/aurum.json`, rename it, change the values, add its fonts to `index.html`, run `npm run tokens`.
No component code changes.

## Known limits

- Reduced-motion behaviour is implemented but not yet tested with the setting switched on.
- The style check is a text scan, not a CSS parser. It catches the usual slips, not every way to hard-code a value.
- Fonts load from Google Fonts, not self-hosted.
- No automated tests yet.
