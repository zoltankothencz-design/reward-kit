export type Prize = { multiplier: number; chance: number };
export type Bucket = { label: string; share: number };

export type SimulationInput = {
  game?: Prize[];
  bet: number;
  spins: number;
  start: number;
  players: number;
  seed: number;
};

export type SimulationResult = {
  rtp: number;
  wagered: number;
  expectedEnd: number;
  meanEnd: number;
  buckets: Bucket[];
  percentiles: { p5: number; p25: number; median: number; p75: number; p95: number; max: number };
  ranDryShare: number;
  aboveStartShare: number;
  hitBiggestShare: number;
  averageSpinsPlayed: number;
  biggestPrize: number;
};

export const ILLUSTRATIVE_GAME: Prize[];
export const DEFAULTS: { bet: number; spins: number; start: number; players: number; seed: number };
export function rtpOf(game: Prize[]): number;
export function seededRandom(seed: number): () => number;
export function simulate(input: SimulationInput): SimulationResult;
