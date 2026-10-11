# Figma

The Figma file is generated from the tokens. The code is the source of truth: change `tokens/*.json`, regenerate, run the
scripts again. Nothing in the Figma file is edited by hand.

File: https://www.figma.com/design/94Az9eq8RQ8ax5NWJ7hJJk (owner's drafts; ask for access).

## What is in the file

- **100 variables.** 37 in `Core` (spacing, font sizes, every motion duration and curve) and 21 per brand (15 colours, 3 radii,
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

## Limits

- Motion values are stored as numbers and text for reference. Figma cannot play them; `docs/MOTION.md` is the motion spec.
- Letter spacing is in em in the tokens. Figma number variables have no em unit, so it is stored as text and not bound.
- The primitives themselves (chest, level bar, offer card, daily streak) are not built as Figma components. Only tokens and the
  specimen sheet are.
- Colours derived in CSS with `color-mix` (the wood and gold shades) have no Figma variable; only the three chest colours they
  are derived from do.
