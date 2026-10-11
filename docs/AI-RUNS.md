# Template runs

Generated from `docs/ai-runs.json` by the template scripts. Do not edit by hand.

Each row is one template started from a brief.

- **Result**: minutes from `npm run template:new` to the first `npm run template:verify` that passed every gate, or
  "stopped, gap reported" when the builder found the primitives could not serve the brief and said so.
- **Gate attempts**: how many times verify ran. 1 means it passed first time.
- **Also changed**: files changed besides the template and its registry entry. Empty means the brief was met by
  arranging primitives only.
- **Owner review**: what a person found when looking at the result in the browser. The gates cannot see layout,
  so this column is where their blind spots show.

| Template | Brief | Built by | Result | Gate attempts | First failed gate | Also changed | Gaps reported | Owner review |
|---|---|---|---|---|---|---|---|---|
| WeeklyChallenge | Weekly challenge: spin 50 times this week to open a chest. Show the progress, and let the player start the next week after collecting. | Claude Opus 5.5 (wrote the kit, dry run) | 0.4 min | 1 |  | src/lib/economy.ts |  | Built by the kit's author as a dry run of the tooling. Not evidence that a newcomer succeeds. |
| ComebackBonus | Comeback bonus: a player returns after a week away. Welcome them back with a chest they can open, and beside it one special coin offer that expires in 30 minutes. | Claude Sonnet 5.5 (cold agent) | 0.4 min | 2 | unfinished |  |  | Brief says the offer sits beside the chest; the result stacked them and the offer badge overlapped the chest's Open button. No gate can see that. Owner changed one class to the new rk-template__pair helper. The agent edited economy.ts before starting the clock, so the time and the empty 'also changed' cell understate its work (it said so itself); whole agent run took 68 s. template:new now refuses a dirty tree. |
| VipLadder | VIP ladder: players earn VIP points by buying coin packs. Show their VIP tier and their progress to the next tier. Buying a pack adds points, and reaching a new tier pays a chest. | Claude Sonnet 5.5 (cold agent) | 0.5 min | 2 | unfinished | src/lib/economy.ts |  | Rule and numbers correct: 80 + 300 points land on tier 4 with 16 of 173, as worked out by hand. The chest appeared below the three packs, out of sight after a purchase; owner moved the stage above the packs. Whole agent run took 73 s. |
| DailyPrizeWheel | Daily prize wheel: a wheel with eight prize segments. The player taps Spin, the wheel turns and lands on one prize, and they collect it. One spin per day. | Claude Sonnet 5.5 (cold agent) | stopped, gap reported | 1 | unfinished |  | No primitive draws or rotates a segmented wheel that lands on a chosen segment | Correct call: it did not fake a wheel. Whole agent run took 41 s. Showed the tooling had no clean way to stop; template:abandon was added because of this run. |
| DailyPrizeWheel | Daily prize wheel: a wheel with eight prize segments. The player taps Spin, the wheel turns and lands on one prize, and they collect it. One spin per day. | Claude Sonnet 5.5 | 0.5 min | 1 |  |  | PrizeWheel's built-in button cannot be disabled or hidden from outside, and reads "Spin again" after a spin, so a one-spin-per-day rule cannot be shown to the player | Checked in the browser (Amber, desktop and 375 px): wheel lands on the chosen slice, the chest opens beside it (stacked on a phone), no overflow. Confirmed the agent's gap: the wheel's Spin again button stays clickable, so one spin per day is enforced in logic but cannot be shown to the player. The primitive needs a locked prop. The first (2026-10-11) run of this brief stopped for lack of a wheel; with PrizeWheel it was built in 0.5 min, 1 gate attempt, nothing changed outside the template. |
