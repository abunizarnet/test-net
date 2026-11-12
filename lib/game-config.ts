export type UpgradeId = "tap" | "gloves" | "auto" | "rig";

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  improves: "tap" | "rate";
  perLevel: number;
  baseCost: number;
  growth: number;
  blurb: string;
}

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: "tap",
    name: "Sharper Pickaxe",
    improves: "tap",
    perLevel: 1,
    baseCost: 25,
    growth: 1.5,
    blurb: "More coins from every tap",
  },
  {
    id: "gloves",
    name: "Golden Gloves",
    improves: "tap",
    perLevel: 6,
    baseCost: 450,
    growth: 1.62,
    blurb: "A big jump in tap value",
  },
  {
    id: "auto",
    name: "Auto Miner",
    improves: "rate",
    perLevel: 1,
    baseCost: 60,
    growth: 1.55,
    blurb: "Mines coins while you are away",
  },
  {
    id: "rig",
    name: "GPU Rig",
    improves: "rate",
    perLevel: 8,
    baseCost: 900,
    growth: 1.68,
    blurb: "A heavy boost to passive mining",
  },
];

export type Levels = Record<UpgradeId, number>;

export const EMPTY_LEVELS: Levels = { tap: 0, gloves: 0, auto: 0, rig: 0 };

export const BASE_TAP_VALUE = 1;
export const MAX_LEVEL = 200;
export const PASSIVE_CAP_SECONDS = 4 * 60 * 60;

export const QUIZ_CORRECT_REWARD = 250;
export const QUIZ_COMPLETION_REWARD = 1000;
export const QUIZ_QUESTIONS_PER_DAY = 5;

export function upgradeCost(def: UpgradeDefinition, level: number): number {
  return Math.floor(def.baseCost * Math.pow(def.growth, level));
}

export function tapValue(levels: Levels): number {
  return UPGRADES.filter((u) => u.improves === "tap").reduce(
    (sum, u) => sum + u.perLevel * levels[u.id],
    BASE_TAP_VALUE,
  );
}

export function miningRate(levels: Levels): number {
  return UPGRADES.filter((u) => u.improves === "rate").reduce(
    (sum, u) => sum + u.perLevel * levels[u.id],
    0,
  );
}

export function pendingCoins(rate: number, lastCollectAt: number, now: number): number {
  const seconds = Math.max(0, Math.min((now - lastCollectAt) / 1000, PASSIVE_CAP_SECONDS));
  return Math.floor(rate * seconds);
}

export function sanitizeLevels(input: unknown): Levels {
  const out: Levels = { ...EMPTY_LEVELS };
  if (typeof input !== "object" || input === null) return out;
  for (const def of UPGRADES) {
    const raw = (input as Record<string, unknown>)[def.id];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      out[def.id] = Math.max(0, Math.min(MAX_LEVEL, Math.floor(raw)));
    }
  }
  return out;
}
