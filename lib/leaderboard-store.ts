export interface LeaderboardRecord {
  uid: string;
  username: string;
  total: number;
  updatedAt: number;
}

export interface RankedEntry {
  rank: number;
  username: string;
  total: number;
  isMe: boolean;
}

interface Store {
  players: Map<string, LeaderboardRecord>;
}

const globalStore = globalThis as unknown as { __cptLeaderboard?: Store };

function getStore(): Store {
  if (!globalStore.__cptLeaderboard) {
    globalStore.__cptLeaderboard = { players: new Map() };
  }
  return globalStore.__cptLeaderboard;
}

function sorted(): LeaderboardRecord[] {
  return [...getStore().players.values()].sort(
    (a, b) => b.total - a.total || a.updatedAt - b.updatedAt,
  );
}

export function getRecord(uid: string): LeaderboardRecord | undefined {
  return getStore().players.get(uid);
}

export function upsertTotal(uid: string, username: string, total: number): LeaderboardRecord {
  const store = getStore();
  const existing = store.players.get(uid);
  const next: LeaderboardRecord = {
    uid,
    username,
    total: existing ? Math.max(existing.total, total) : total,
    updatedAt: Date.now(),
  };
  store.players.set(uid, next);
  return next;
}

export function topEntries(limit: number, viewerUid: string | null) {
  const all = sorted();
  const entries: RankedEntry[] = all.slice(0, limit).map((r, i) => ({
    rank: i + 1,
    username: r.username,
    total: r.total,
    isMe: viewerUid !== null && r.uid === viewerUid,
  }));

  let me: RankedEntry | null = null;
  if (viewerUid) {
    const index = all.findIndex((r) => r.uid === viewerUid);
    if (index >= 0) {
      me = {
        rank: index + 1,
        username: all[index].username,
        total: all[index].total,
        isMe: true,
      };
    }
  }

  return { entries, me, totalPlayers: all.length };
}
