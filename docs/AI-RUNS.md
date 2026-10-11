# Template runs

Generated from `docs/ai-runs.json` by the template scripts. Do not edit by hand.

Each row is one template built from a brief. The clock starts at `npm run template:new` and stops at the first
`npm run template:verify` that passes every gate, so it includes thinking time. "Gate attempts" counts verify runs;
1 means it passed first time. "Also changed" lists files touched outside the template itself: an empty cell means the
brief was met by arranging primitives only.

| Template | Brief | Built by | Minutes | Gate attempts | First failed gate | Also changed | Gaps reported |
|---|---|---|---|---|---|---|---|
| WeeklyChallenge | Weekly challenge: spin 50 times this week to open a chest. Show the progress, and let the player start the next week after collecting. | Claude Opus 5.5 (wrote the kit, dry run) | 0.4 | 1 |  | src/lib/economy.ts |  |
