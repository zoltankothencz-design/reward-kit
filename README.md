# Reward Kit

A code-first design system for reward and gamification mechanics, themed for several brands.
The brands (Aurum, Amber, Frost) are fictional. Built with Claude Code.

## Status

Phases 1 to 3 of 5 are done. Phase 4 is built and tried once by its author; it still needs a trial by an agent that has never seen the code.

| Phase | Content | State |
|---|---|---|
| 1 | Tokens, three brands, reward chest | done |
| 2 | Level bar, offer card, daily streak, three templates | done |
| 3 | Motion spec page, reward economy calculator | done |
| 4 | Skill and tooling that build a new mechanic from a brief, with measured runs | built, cold trial pending |
| 5 | Figma library generated from the tokens | |

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:5183. Three tabs: Gallery, Motion spec, Economy.

## How it is organised

- `tokens/core.json`: spacing, type scale and **motion** (durations, easing curves, the timing of every primitive). Shared by every brand.
- `tokens/brands/*.json`: colour, fonts and corner radius. One file per brand.
- `tokens/motion-usage.json`: which component uses which motion token, beat by beat.
- `src/components/`: the primitives. `RewardChest`, `LevelBar`, `OfferCard`, `DailyStreak`, plus the shared `Coin` icon.
- `src/templates/`: screens made only of primitives plus the rule that connects them. `index.ts` is the registry the Gallery reads.
- `.claude/skills/new-mechanic/SKILL.md`: the procedure an agent follows to build a new template from a brief.
- `docs/PRIMITIVES.md`: every primitive and helper with its props, what it is for and what it is not for. Generated.
- `docs/AI-RUNS.md`: one measured row per template built through the skill. Generated.
- `src/lib/economy.ts`: the reward numbers (level curve, level rewards, daily rewards, store packs) and a 30-day player simulation.
- `docs/MOTION.md`: the motion spec for engineers. Generated, do not edit by hand.

## What the build enforces

`npm run build` runs six checks before it bundles anything.

| Command | Fails when |
|---|---|
| `npm run tokens` | a brand misses or adds a token, tries to override a core (motion) token, or has text below the WCAG contrast minimum |
| `npm run check` | a component or template hard-codes a colour or a font; a component hard-codes a duration; a template uses motion, inline styles, drawing, timers, its own stylesheet or an import outside primitives and helpers; a template is not in the registry |
| `npm run catalog` | a primitive has no `@primitive` description or no `type Props` to document |
| `npm run spec` | the motion spec names a token or curve the code does not use, or a motion token is not documented |
| `npm run test` | the economy numbers change: level curve, store maths, coin conservation, hand-worked cases |
| `tsc --noEmit` | the types do not line up |

## Building a new mechanic from a brief

The slow, repeated parts of adding a screen by hand were: creating the file, wiring it into the page, writing layout CSS,
remembering the rules, and running the checks. Each is now a tool or a rule the build enforces.

```bash
npm run template:new -- WeeklyChallenge "Spin 50 times this week to open a chest" --by "who"
# fill in src/templates/WeeklyChallenge.tsx using docs/PRIMITIVES.md
npm run template:verify -- WeeklyChallenge
```

`template:new` creates the file, registers it (it shows in the Gallery at once) and starts a clock. `template:verify` runs every
gate, names the first one that fails, and on the first pass stops the clock. Time, number of attempts, files touched outside the
template and any reported gap are written to `docs/AI-RUNS.md` by the scripts, not by whoever did the work.

When a brief needs something no primitive does, the rule is to report the gap (`--gap "..."`), not to build it inside the
template. A list of gaps is how the system's owner learns which primitive to build next.

An agent is pointed at `.claude/skills/new-mechanic/SKILL.md`, which holds the same procedure with the rules spelled out.

## Adding a brand

Copy `tokens/brands/aurum.json`, rename it, change the values, add its fonts to `index.html`, run `npm run tokens`.
No component code changes.

## The economy model, and its limit

The Economy tab plays one player through 30 days: daily streak and level rewards come in, every spin loses bet x (1 - RTP), and a
player who cannot afford a spin either waits for tomorrow or buys a pack. It reports how much of the planned play free coins pay
for, the first day the wallet runs dry, and what a buyer spends.

It is an average-case model. Real slot results swing widely around the average, so real players run dry earlier or later than it
says. Use it to compare settings, not to predict one player. The "too generous / balanced / tight" label is a rule of thumb for
this demo, not an industry benchmark.

## Known limits

- Reduced-motion behaviour is implemented but not yet tested with the setting switched on.
- The style check is a text scan, not a CSS parser. It catches the usual slips, not every way to hard-code a value.
- The motion spec check proves a file uses a token, not that it uses it for the beat the spec describes.
- `motion.easing.in` is defined but no component uses it yet.
- Fonts load from Google Fonts, not self-hosted.
- Only the economy has automated tests. Components are checked by hand in the browser.
- `docs/AI-RUNS.md` has one row so far, and it was built by the kit's author, who already knew every rule. It shows the tooling works, not that a newcomer succeeds. There is no measured "before" time for building a template by hand, so no speed-up is claimed.
- The "also changed" column compares file hashes against the moment `template:new` ran; it cannot tell who made a change.
