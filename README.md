# Reward Kit

A code-first design system for reward and gamification mechanics, themed for several brands.
The brands (Aurum, Amber, Frost) are fictional. Built with Claude Code.

**Live demo: https://zoltankothencz-design.github.io/reward-kit/** (deployed from `main` by `.github/workflows/pages.yml`, which runs the full build first).

## Status

All five phases are done, and a prize wheel was added afterwards because the cold trial showed the kit lacked one. Phase 4 was tried by agents that had never seen the code; what they did and what the trial exposed is below.

| Phase | Content | State |
|---|---|---|
| 1 | Tokens, three brands, reward chest | done |
| 2 | Level bar, offer card, daily streak, first templates | done |
| 3 | Motion spec page, reward economy calculator | done |
| 4 | Skill and tooling that build a new mechanic from a brief, with measured runs | done, one trial of three briefs and one re-run |
| 5 | Figma variables and brand sheet generated from the tokens | done (tokens and specimen only, no components) |
| after | Prize wheel primitive, daily prize wheel template, automated reduced-motion test | done |

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:5183. Three tabs: Gallery, Motion spec, Economy.

`npm run build` runs every check and the unit tests. `npm run test:motion` is separate because it needs Chrome or Edge installed (see Known limits).

## How it is organised

- `tokens/core.json`: spacing, type scale and **motion** (durations, easing curves, the timing of every primitive). Shared by every brand.
- `tokens/brands/*.json`: colour, fonts and corner radius. One file per brand.
- `tokens/motion-usage.json`: which component uses which motion token, beat by beat.
- `src/components/`: the primitives. `RewardChest`, `PrizeWheel`, `LevelBar`, `OfferCard`, `DailyStreak`, plus the shared `Coin` icon.
- `src/templates/`: screens made only of primitives plus the rule that connects them. `index.ts` is the registry the Gallery reads.
- `.claude/skills/new-mechanic/SKILL.md`: the procedure an agent follows to build a new template from a brief.
- `docs/PRIMITIVES.md`: every primitive and helper with its props, what it is for and what it is not for. Generated.
- `docs/AI-RUNS.md`: one measured row per template built through the skill. Generated.
- `src/lib/economy.ts`: the reward numbers (level curve, level rewards, daily rewards, store packs, prize wheel slices and odds) and a 30-day player simulation.
- `docs/MOTION.md`: the motion spec for engineers. Generated, do not edit by hand.
- `figma/` and `docs/FIGMA.md`: scripts that build the Figma variables and brand sheet from the tokens, and what is in the file.

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

If no honest version can be built, `npm run template:abandon -- Name --gap "..."` removes the unfinished file and closes the run
with the gap on record. After looking at a result in the browser, `npm run template:review -- Name "..."` adds the owner's note
to the run.

An agent is pointed at `.claude/skills/new-mechanic/SKILL.md`, which holds the same procedure with the rules spelled out.

### The cold trial

Three agents (Claude Sonnet 5.5), each in its own clean checkout, each given only a brief and told to follow the skill. None saw
how the kit was built. They could not open a browser. Full rows are in `docs/AI-RUNS.md`.

| Brief | What happened | What the owner found afterwards |
|---|---|---|
| Comeback bonus: a chest, and beside it an offer that expires in 30 minutes | Built, every gate passed | The two were stacked, not side by side, and a badge overlapped a button. No gate can see layout. Fixed by one class change, after adding a two-column layout helper the kit was missing. |
| VIP ladder: buying packs earns points, a new tier pays a chest | Built, every gate passed, numbers correct | The chest appeared below the packs, out of sight after a purchase. Moved up. |
| Daily prize wheel with eight segments | Stopped and reported the gap: no primitive draws or turns a wheel | Correct call. It did not fake a wheel out of other parts. |

Whole runs took 41 to 73 seconds each, reading included.

What the trial changed in the kit:

- The repository did not build from a fresh clone (a missing folder, and line endings on Windows). Fixed.
- The clock used to start after the planning step, and one agent edited a file before starting it, so the first measured times
  cover only writing and verifying. `template:new` is now the first step and refuses a tree with uncommitted changes.
- There was no clean way to stop on a gap. `template:abandon` was added.
- A two-column layout helper was missing; the skill now maps the brief's words about position to layout classes.

### The re-run: wheel built, gap found

After the wheel primitive existed, the same prize wheel brief was given to a fresh agent in a clean checkout. It built the template in
0.5 minutes with one gate attempt and changed nothing outside the template and its registry entry. Looked at in the browser, it
worked on desktop and a phone-width screen: the wheel stops on the chosen slice and the chest opens beside it.

The agent reported one gap that the gates could not have found: the wheel's own button could not be locked, so "one spin per day"
was enforced in code but invisible to the player. The owner added a `lockedLabel` prop to the wheel and the template now passes
"Come back tomorrow". That change touched the primitive and one shared button style, so it is recorded as the owner's, not the
agent's.

What it does not show: four runs on three briefs are an anecdote, not a rate. The agents could not look at their own work. Two of
the three finished templates needed a human correction for layout, and the third needed a change to a primitive. There is still no
measured time for building a template by hand, so no speed-up is claimed.

## Beyond the average: a Monte Carlo run

```bash
npm run simulate
```

The Economy tab gives an average. `npm run simulate` shows what that average hides: it plays 20,000 simulated players through
1,000 spins of a made-up slot (bet EUR 2, start EUR 200, 95% RTP) and prints how they are spread. The expected-value maths says
the average player ends with EUR 100; the simulation says 61% run out of money first and the median player ends with nothing,
while a few percent win many times their stake. All numbers can be changed (`npm run simulate -- --bet 5 --spins 500`) and a
seed makes a run repeatable. The game's prize table is invented, so read the output as an illustration of why an average is not
enough, not as a statement about a real game. The unit tests check that, with a bottomless wallet, the simulation agrees with the
expected-value maths. The same simulation runs in the browser on the Economy tab, behind a button.

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

- Reduced motion has an automated check, `npm run test:motion`: it opens the gallery in Chrome or Edge with the setting emulated and fails if anything animates or an element misses its end state; a control run without the setting must show the motion. It needs a browser installed, so it is not part of `npm run build`, and on a machine without one it cannot run. It covers the wheel, chest, level bar, daily streak and offer card (the coin and the buttons have no motion of their own beyond what these checks see).
- The style check is a text scan, not a CSS parser. It catches the usual slips, not every way to hard-code a value.
- The motion spec check proves a file uses a token, not that it uses it for the beat the spec describes.
- `motion.easing.in` is defined but no component uses it yet.
- Fonts load from Google Fonts, not self-hosted.
- Automated tests cover the economy (13 unit tests) and reduced motion. Everything else about the components, including how they look, is checked by hand in the browser.
- The times in the first four rows of `docs/AI-RUNS.md` were recorded before the clock was moved to the start of the procedure, so they understate the work. Later rows are comparable with each other, not with those.
- No gate checks layout. A template can pass everything and still put things in the wrong place; only looking at it finds that.
