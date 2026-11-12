import { NextResponse } from "next/server";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";
import { getRecord, topEntries, upsertTotal } from "@/lib/leaderboard-store";

const MAX_TOTAL = 1e15;
const MIN_SUBMIT_GAP_MS = 4000;
const TOKEN_TTL_MS = 10 * 60 * 1000;
const LIST_SIZE = 50;

interface VerifiedUser {
  uid: string;
  username: string;
  verifiedAt: number;
}

const verifiedTokens = new Map<string, VerifiedUser>();

async function verifyWithAppStudio(accessToken: string): Promise<VerifiedUser | null> {
  const cached = verifiedTokens.get(accessToken);
  if (cached && Date.now() - cached.verifiedAt < TOKEN_TTL_MS) return cached;

  try {
    const response = await fetch(`${PI_NETWORK_CONFIG.BACKEND_URL}/pi/auth/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      user?: { uid?: unknown; username?: unknown };
    };
    const uid = data.user?.uid;
    const username = data.user?.username;
    if (typeof uid !== "string" || typeof username !== "string" || !uid || !username) {
      return null;
    }
    const verified: VerifiedUser = { uid, username, verifiedAt: Date.now() };
    if (verifiedTokens.size > 5000) verifiedTokens.clear();
    verifiedTokens.set(accessToken, verified);
    return verified;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewer = searchParams.get("viewer");
  const data = topEntries(LIST_SIZE, viewer && viewer.length < 128 ? viewer : null);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let body: { accessToken?: unknown; total?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { accessToken, total } = body;
  if (typeof accessToken !== "string" || accessToken.length < 10 || accessToken.length > 4096) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof total !== "number" || !Number.isFinite(total) || total < 0 || total > MAX_TOTAL) {
    return NextResponse.json({ error: "Invalid total" }, { status: 400 });
  }

  const user = await verifyWithAppStudio(accessToken);
  if (!user) {
    return NextResponse.json({ error: "Player could not be verified" }, { status: 401 });
  }

  const existing = getRecord(user.uid);
  if (existing && Date.now() - existing.updatedAt < MIN_SUBMIT_GAP_MS) {
    return NextResponse.json({ uid: user.uid, ok: true, throttled: true });
  }

  upsertTotal(user.uid, user.username, Math.floor(total));
  return NextResponse.json({ uid: user.uid, ok: true });
}
