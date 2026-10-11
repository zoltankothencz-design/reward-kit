---
name: new-mechanic
description: Build a new reward or gamification screen (a "template") in Reward Kit from a short brief, using only the existing primitives. Use when asked for a new mechanic, screen, offer flow, bonus, challenge or progression screen in this repository.
---

# New mechanic from a brief

You are adding one template to Reward Kit. A template is a screen that **arranges existing primitives and adds one rule that connects them**. It does not draw, style or animate anything itself. The build enforces this, so work with it, not around it.

The person who gave you the brief will not look over your shoulder. Finish the whole procedure and report at the end.

## Procedure

1. **Read `docs/PRIMITIVES.md`.** It is generated from the source and lists every primitive and helper with its props, what it is for and what it is not for. Read one existing template in `src/templates/` to see the shape. You do not need to read component source.

2. **Decide the composition before writing code.** Write down, in two or three lines:
   - which primitives you will use, and what each one stands for in this brief,
   - the one rule that connects them (for example: "collecting a day opens that day's chest"),
   - where every number comes from in `src/lib/economy.ts`.

   If the brief needs something no primitive does, see "When the primitives are not enough" before going further.

3. **Start the run.** This creates the file, registers it and starts the clock.

   ```bash
   npm run template:new -- <PascalCaseName> "<the brief, one or two sentences>" --by "<your model or name>"
   ```

4. **Fill in `src/templates/<PascalCaseName>.tsx`.** Replace every TODO. Keep the comment at the top: it must name the primitives used and the connecting rule.

5. **Verify.** This runs every gate and records the attempt.

   ```bash
   npm run template:verify -- <PascalCaseName>
   ```

   If a gate fails, read the message, fix the cause, and run it again. Do not weaken a check, delete a test or edit a script to get through.

6. **Look at it.** Run `npm run dev`, open http://localhost:5183 and find your template at the bottom of the Templates section. Click through every state. Switch the brand at the top to all three: nothing may break or become unreadable. Fix what you find and verify again.

7. **Report** in this shape:
   - the composition from step 2,
   - what you checked by hand in step 6, and what you could not check,
   - the row for your template from `docs/AI-RUNS.md`,
   - any gap you recorded.

## What a template may contain

- Imports from `react`, `../components/*`, `../lib/*` and `./TemplateShell`. Nothing else.
- `TemplateShell` as the outer element, with a `title` and a one-sentence `intro`.
- Primitives, plain buttons with class `rk-button` (add `rk-button--quiet` for a secondary action), headings, and text.
- These layout classes from `templates.css`: `rk-template__row`, `rk-template__stack`, `rk-template__grid`, `rk-template__stage`, `rk-template__hint`.
- React state and the connecting rule.

## What a template may not contain

The check fails on each of these. They are listed so you do not spend an attempt finding out.

- Colours, fonts or durations written by hand. No `style={...}`.
- Animation, transition or keyframes. Motion lives in primitives.
- `<svg>` or `<canvas>`. Drawing lives in primitives.
- `setTimeout`, `setInterval` or `requestAnimationFrame`. Sequencing lives in primitives and helpers; `RewardChest` has `autoPlay`, and `useLevelProgress` sequences level changes.
- Its own CSS file, or edits to `templates.css`.
- Reward amounts typed inline. Import them from `src/lib/economy.ts`. If the brief needs a new amount, add it there as a named constant or function with a one-line comment, and say so in your report.

## Writing for the player

- One primary action on screen at a time. Use `rk-button` for it and `rk-button--quiet` for everything else.
- Button labels say what happens: "Collect day 4", not "OK".
- The demo must be playable without a backend: give it a button that stands in for the real trigger (for example "+10 spins"), and a way to start over.
- Mount a `RewardChest` only when there is a reward to show. Reserve its space with `rk-template__stage` so the panel does not jump.
- Choose the chest tier by how big the reward is next to the other rewards in the same flow, not by habit.

## When the primitives are not enough

Do not build the missing piece inside the template, and do not edit a primitive, a stylesheet or the tokens to make room for it. Instead:

1. Build the closest version the primitives allow, if that still serves the brief. If it does not, stop after step 3 and say so.
2. Record the gap, in one sentence that names the missing capability, not a solution:

   ```bash
   npm run template:verify -- <PascalCaseName> --gap "No primitive shows a countdown that is not attached to an offer"
   ```

3. Put the gap at the top of your report. A recorded gap is a useful result: it tells the system's owner which primitive to build next.

## Done means

- `npm run template:verify` passed, and `docs/AI-RUNS.md` shows your row with a time.
- The "Also changed" cell of your row is empty, or lists only `src/lib/economy.ts` with the reason in your report.
- You opened the template in the browser in all three brands, or you say plainly that you could not.
- No TODO is left in your file.
