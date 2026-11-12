"use client";

import { Coins, Hand, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { formatCoins } from "@/lib/format";
import { PASSIVE_CAP_SECONDS, pendingCoins } from "@/lib/game-config";
import { AiPanel } from "./ai-panel";
import { Coin } from "./coin";
import { useGame } from "./game-provider";

export function MinerScreen() {
  const { state, tapAmount, rate, tap, collect } = useGame();
  const now = useNow(1000);
  const pending = pendingCoins(rate, state.lastCollectAt, now);
  const capCoins = rate * PASSIVE_CAP_SECONDS;
  const full = rate > 0 && pending >= capCoins;
  const levelsKey = JSON.stringify(state.levels);

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="Coin balance" className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Balance
        </p>
        <p className="text-glow-gold flex items-center justify-center gap-2 text-5xl font-black tabular-nums text-primary">
          <Coins className="size-9" aria-hidden="true" />
          {formatCoins(state.coins)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          {state.totalMined.toLocaleString("en-US")} mined in total
        </p>
      </section>

      <Coin value={tapAmount} onTap={tap} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hand className="size-3.5" aria-hidden="true" /> Per tap
          </p>
          <p className="text-2xl font-black tabular-nums text-primary">+{formatCoins(tapAmount)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="size-3.5" aria-hidden="true" /> Per second
          </p>
          <p className="text-2xl font-black tabular-nums text-accent">+{formatCoins(rate)}</p>
        </div>
      </div>

      <section
        aria-label="Passive mining"
        className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Ready to collect
          </p>
          <p className="text-3xl font-black tabular-nums text-foreground">{formatCoins(pending)}</p>
          <p className="text-xs text-muted-foreground">
            {rate === 0
              ? "Buy a passive upgrade to start mining"
              : full
                ? "Storage full: collect now"
                : "Stores up to 4 hours of mining"}
          </p>
        </div>
        <Button size="lg" onClick={collect} disabled={pending <= 0} className="font-bold">
          Collect
        </Button>
      </section>

      <AiPanel
        key={levelsKey}
        title="AI earnings coach"
        requestKey="miner"
        body={{ mode: "miner", levels: state.levels }}
        buttonLabel="Explain my earning setup"
      />
    </div>
  );
}
