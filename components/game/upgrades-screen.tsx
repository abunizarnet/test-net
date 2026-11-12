"use client";

import { Coins, Cpu, Hammer, Hand, Lock, Zap, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCoins } from "@/lib/format";
import { MAX_LEVEL, UPGRADES, upgradeCost, type UpgradeId } from "@/lib/game-config";
import { useGame } from "./game-provider";

const ICONS: Record<UpgradeId, LucideIcon> = {
  tap: Hammer,
  gloves: Hand,
  auto: Zap,
  rig: Cpu,
};

export function UpgradesScreen() {
  const { state, buy, tapAmount, rate } = useGame();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">Upgrades</h2>
          <p className="text-sm text-muted-foreground">
            +{formatCoins(tapAmount)} per tap, +{formatCoins(rate)} per second
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xl font-black tabular-nums text-primary">
          <Coins className="size-5" aria-hidden="true" />
          {formatCoins(state.coins)}
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {UPGRADES.map((upgrade) => {
          const level = state.levels[upgrade.id];
          const cost = upgradeCost(upgrade, level);
          const maxed = level >= MAX_LEVEL;
          const affordable = !maxed && state.coins >= cost;
          const Icon = ICONS[upgrade.id];
          const gain =
            upgrade.improves === "tap"
              ? `+${upgrade.perLevel} per tap`
              : `+${upgrade.perLevel} per second`;

          return (
            <li
              key={upgrade.id}
              className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
                affordable
                  ? "border-accent/70 bg-card glow-purple"
                  : "border-border bg-card/60 opacity-70"
              }`}
            >
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                  affordable ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-bold text-foreground">
                  <span className="truncate">{upgrade.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                    Lv {level}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{upgrade.blurb}</p>
                <p className="text-sm font-semibold text-primary">{gain} each level</p>
              </div>
              <Button
                onClick={() => buy(upgrade.id)}
                disabled={!affordable}
                aria-label={`Buy ${upgrade.name} level ${level + 1} for ${cost} coins`}
                className="h-auto shrink-0 flex-col gap-0 px-3 py-2 font-bold"
              >
                {maxed ? (
                  "Max"
                ) : (
                  <>
                    {!affordable && <Lock className="size-3.5" aria-hidden="true" />}
                    <span className="tabular-nums">{formatCoins(cost)}</span>
                  </>
                )}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
