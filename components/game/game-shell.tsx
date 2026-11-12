"use client";

import { useState } from "react";
import { Brain, Coins, Trophy, Wrench, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { GameProvider, useGame } from "./game-provider";
import { LeaderboardScreen } from "./leaderboard-screen";
import { MinerScreen } from "./miner-screen";
import { QuizScreen } from "./quiz-screen";
import { UpgradesScreen } from "./upgrades-screen";

type Tab = "mine" | "upgrades" | "quiz" | "ranks";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "mine", label: "Mine", icon: Coins },
  { id: "upgrades", label: "Upgrades", icon: Wrench },
  { id: "quiz", label: "Quiz", icon: Brain },
  { id: "ranks", label: "Ranks", icon: Trophy },
];

const SAVE_LABEL = {
  saved: "Progress saved",
  pending: "Saving...",
  retrying: "Save failed, retrying",
} as const;

function Game() {
  const [tab, setTab] = useState<Tab>("mine");
  const { user } = usePiAuth();
  const { loadStatus, saveStatus, retryLoad } = useGame();

  if (loadStatus === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground">
        <Spinner className="size-5" /> Loading your mining rig...
      </main>
    );
  }

  if (loadStatus === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-bold text-foreground">Could not load your progress</p>
        <p className="text-sm text-muted-foreground">
          Your saved coins are safe. Check your connection and try again.
        </p>
        <Button onClick={retryLoad}>Try again</Button>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="text-lg font-black tracking-tight text-foreground">
          Crypto <span className="text-primary">Pi</span> Token
        </h1>
        <div className="text-right">
          <p className="max-w-40 truncate text-sm font-semibold text-accent">
            {user ? `@${user.username}` : ""}
          </p>
          <p className="text-[11px] text-muted-foreground" aria-live="polite">
            {SAVE_LABEL[saveStatus]}
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-2">
        {tab === "mine" && <MinerScreen />}
        {tab === "upgrades" && <UpgradesScreen />}
        {tab === "quiz" && <QuizScreen />}
        {tab === "ranks" && <LeaderboardScreen />}
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="mx-auto flex max-w-lg">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <li key={id} className="flex-1">
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={active ? "page" : undefined}
                  className={`tap-target flex w-full flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function GameShell() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
