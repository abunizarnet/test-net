"use client";

import useSWR from "swr";
import { Crown } from "lucide-react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { Spinner } from "@/components/ui/spinner";
import { formatCoins } from "@/lib/format";
import { useGame } from "./game-provider";

interface Entry {
  rank: number;
  username: string;
  total: number;
  isMe: boolean;
}

interface BoardResponse {
  entries: Entry[];
  me: Entry | null;
  totalPlayers: number;
}

async function fetchBoard(url: string): Promise<BoardResponse> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Leaderboard unavailable");
  return response.json();
}

function Row({ entry }: { entry: Entry }) {
  const top = entry.rank <= 3;
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
        entry.isMe ? "border-primary bg-primary/10 glow-gold" : "border-border bg-card"
      }`}
      aria-current={entry.isMe ? "true" : undefined}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black tabular-nums ${
          top ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {entry.rank === 1 ? <Crown className="size-4" aria-label="Rank 1" /> : entry.rank}
      </span>
      <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
        {entry.username}
        {entry.isMe && <span className="ml-2 text-xs font-bold text-primary">YOU</span>}
      </span>
      <span className="font-black tabular-nums text-primary">{formatCoins(entry.total)}</span>
    </li>
  );
}

export function LeaderboardScreen() {
  const { user } = usePiAuth();
  const { syncStatus, state } = useGame();
  const key = user ? `/api/leaderboard?viewer=${encodeURIComponent(user.uid)}` : null;
  const { data, error, isLoading } = useSWR(key, fetchBoard, { refreshInterval: 15000 });

  const meOnList = data?.entries.some((e) => e.isMe) ?? false;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2 className="text-2xl font-black text-foreground">Leaderboard</h2>
        <p className="text-sm text-muted-foreground">
          Verified Pi players ranked by total coins mined
          {data ? ` (${data.totalPlayers} ranked)` : ""}
        </p>
      </header>

      {syncStatus === "unavailable" && (
        <p className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
          Your score could not be verified yet. Open the app in Pi Browser to join the ranking.
        </p>
      )}

      {isLoading && (
        <p className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Spinner className="size-4" /> Loading ranks...
        </p>
      )}
      {error && <p className="py-8 text-center text-muted-foreground">Could not load the leaderboard.</p>}

      {data && data.entries.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No one is ranked yet. Keep mining to be first.
        </p>
      )}

      {data && data.entries.length > 0 && (
        <ol className="flex flex-col gap-2">
          {data.entries.map((entry) => (
            <Row key={`${entry.rank}-${entry.username}`} entry={entry} />
          ))}
        </ol>
      )}

      {data && !meOnList && (
        <section aria-label="Your rank" className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your rank</h3>
          {data.me ? (
            <ol>
              <Row entry={data.me} />
            </ol>
          ) : (
            <p className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
              {state.totalMined > 0
                ? "Your score is being verified. You will appear here shortly."
                : "Tap the coin to start mining and get ranked."}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
