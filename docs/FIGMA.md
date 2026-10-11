# Figma

The Figma file is generated from the tokens. The code is the source of truth: change `tokens/*.json`, regenerate, run the
scripts again. Nothing in the Figma file is edited by hand.

File: https://www.figma.com/design/94Az9eq8RQ8ax5NWJ7hJJk (owner's drafts; ask for access).

## What is in the file

- **102 variables.** 39 in `Core` (spacing, font sizes, every motion duration and curve) and 21 per brand (15 colours, 3 radii,
  2 font families, 1 letter-spacing value).
- Every variable has a scope, so it only appears in the pickers where it makes sense, and a WEB code syntax that is the real CSS
  variable, for example `var(--rk-color-accent)`. Its description names the token it came from.
- **A "Brand sheet" page** with one specimen frame per brand: swatches, the four reward tiers, and a card with the primary
  button. Every fill, radius, padding, gap, font family and font size on it is bound to a variable.

## How the brands are stored

The intended layout is one `Brand` collection with a mode per brand, so a frame switches brand by switching mode. The file's
Figma plan allows one mode per collection ("Limited to 1 modes only"), so the script fell back to one collection per brand:
`Brand / Aurum`, `Brand / Amber`, `Brand / Frost`, each with the same 21 variable names.

On a plan with modes, delete the three collections and run the scripts again: they will build the single `Brand` collection
with three modes, and the brand sheet will use them. Nothing in the repository needs to change.

## Regenerating

```bash
npm run figma
```

writes `figma/variables.js` from the tokens. Run that script in the file, then `figma/brand-sheet.js`. Both go through the Figma
MCP tool `use_figma` (or any way of running Plugin API code). Both are safe to run again: variables are matched by name and
updated in place, and the brand sheet replaces its own frames.

## Components

The `Components` page holds five sets, drawn by the scripts in `figma/components/`. Every fill, stroke, radius, spacing, font family
and font size is bound to a variable, so changing a token and re-running `npm run figma` updates them.

| Set | Variants | What varies |
|---|---|---|
| `RewardChest` | 24 | Brand x Tier (mini, minor, major, grand) x State (closed, open); text property Amount |
| `PrizeWheel` | 6 | Brand x State (spin, locked); slices follow the prize table in `src/lib/economy.ts` |
| `LevelBar` | 9 | Brand x Progress (25%, 60%, 100%); text property Level |
| `OfferCard` | 6 | Brand x Featured; text properties Name, Coins, Bonus, Price |
| `DailyStreakTile` and `DailyStreak` | 18 and 3 | the tile is Brand x State (claimed, today, upcoming) x Bonus; the row is built from seven tile instances |

```bash
npm run figma:components
```

writes one complete script per component into `figma/components/run/` (a shared prelude plus the component file, checked to compile).
Run each through `use_figma` after `figma/variables.js`. Only `LevelBar` has been rebuilt end to end from these repository files; the
other four were built by the same code in separate runs and were then moved into the repository, so a first re-run of each is worth
a quick visual check.

## Limits

- Motion values are stored as numbers and text for reference. Figma cannot play them; `docs/MOTION.md` is the motion spec.
- Letter spacing is in em in the tokens. Figma number variables have no em unit, so it is stored as text and not bound.
- The components are simplified static drawings of the coded primitives: flat fills instead of gradients, no shine, no sparkles, and
  no motion. They show anatomy, variants and token use, not the finished look of the live demo.
- Brand is a variant property (`Brand=Aurum, Amber, Frost`), not a variable mode, because the file was built on a plan that allowed
  one mode per collection. Each variant is bound to its own brand's variables. With modes, a single component bound to one
  `Brand` collection would switch brand by mode.
- Figma component sets cannot be re-generated incrementally: running a script removes the set of the same name and builds it
  again, so any hand edits to that set are lost.
- Colours derived in CSS with `color-mix` (the wood and gold shades) have no Figma variable; only the three chest colours they
  are derived from do.
