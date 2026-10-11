# Reward Kit

A code-first design system for reward and gamification mechanics. Read `README.md` for the layout of the repository.

## Before you change anything

- `npm run build` must pass when you finish. It runs six checks and then bundles; `README.md` says what each one rejects.
- Never weaken a gate, delete a test or edit a script in `scripts/` to get a change through. If a gate is wrong, say so and stop.
- Do not edit generated files: `src/styles/tokens.css`, `src/tokens/generated.ts`, `docs/MOTION.md`, `docs/PRIMITIVES.md`, `docs/AI-RUNS.md`.

## Where things go

- A new screen made of existing primitives is a **template**. Use the `new-mechanic` skill (`.claude/skills/new-mechanic/SKILL.md`).
- A new visual or animated element is a **primitive**. It needs a `@primitive` comment block, a `type Props`, token-only CSS, and an entry in `tokens/motion-usage.json` for every motion token it uses. Ask before adding one.
- A new brand is one file in `tokens/brands/`. No component changes.
- Reward amounts, prices and level curves live in `src/lib/economy.ts` and nowhere else.

## Style of the code

- Colours, fonts, radii and durations come from tokens. Brands may not override motion.
- End state as a plain CSS property, keyframes describe only where the element comes from, so reduced motion lands on the right state.
- Comments say why, in plain words.
