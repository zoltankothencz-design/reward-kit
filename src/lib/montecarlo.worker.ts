// Runs the Monte Carlo in a background thread so the page stays responsive
// while thousands of players are played out.
import { simulate } from "./montecarlo.mjs";
import type { SimulationInput } from "./montecarlo.mjs";

self.addEventListener("message", (event: MessageEvent<SimulationInput>) => {
  self.postMessage(simulate(event.data));
});
