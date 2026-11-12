import { NextResponse } from "next/server";
import { generateText } from "ai";
import {
  UPGRADES,
  miningRate,
  sanitizeLevels,
  tapValue,
  upgradeCost,
} from "@/lib/game-config";
import { findQuestion } from "@/lib/quiz-data";
import { formatCoins } from "@/lib/format";

const MODEL = "google/gemini-2.5-flash";
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const SYSTEM =
  "You are the AI helper inside Crypto Pi Token, a tap-to-mine game. Reply in plain, friendly language in at most 3 short sentences. Do not use markdown, lists, or emojis. Only use the facts you are given.";

function minerFacts(levelsInput: unknown) {
  const levels = sanitizeLevels(levelsInput);
  const tap = tapValue(levels);
  const rate = miningRate(levels);
  const options = UPGRADES.map((u) => {
    const gain = u.improves === "tap" ? `+${u.perLevel} coins per tap` : `+${u.perLevel} coins per second`;
    return { u, gain, cost: upgradeCost(u, levels[u.id]) };
  });
  return { levels, tap, rate, options };
}

function minerFallback(levelsInput: unknown): string {
  const { tap, rate, options } = minerFacts(levelsInput);
  const cheapest = [...options].sort((a, b) => a.cost - b.cost)[0];
  return `Each tap earns ${tap} ${tap === 1 ? "coin" : "coins"} and your passive mining adds ${rate} per second. The cheapest next upgrade is ${cheapest.u.name} for ${formatCoins(cheapest.cost)} coins, giving ${cheapest.gain}.`;
}

function quizFallback(explanation: string): string {
  return explanation;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let prompt: string;
  let fallback: string;

  if (body.mode === "miner") {
    const { levels, tap, rate, options } = minerFacts(body.levels);
    const lines = options
      .map((o) => `${o.u.name} (level ${levels[o.u.id]}): next level costs ${o.cost} coins and gives ${o.gain}`)
      .join("; ");
    prompt = `Explain this player's earning setup. Tap value: ${tap} coins per tap. Passive rate: ${rate} coins per second (stored up to 4 hours). Upgrades: ${lines}. Say why tap value and passive rate are what they are, and which upgrade would change the most per coin spent.`;
    fallback = minerFallback(body.levels);
  } else if (body.mode === "quiz") {
    const question = typeof body.questionId === "string" ? findQuestion(body.questionId) : undefined;
    const selected = typeof body.selectedIndex === "number" ? Math.floor(body.selectedIndex) : -1;
    if (!question || selected < 0 || selected >= question.options.length) {
      return NextResponse.json({ error: "Unknown question" }, { status: 400 });
    }
    const wasRight = selected === question.answerIndex;
    prompt = `Quiz question: "${question.question}". Correct answer: "${question.options[question.answerIndex]}". The player chose: "${question.options[selected]}" (${wasRight ? "correct" : "incorrect"}). Briefly explain why the correct answer is right${wasRight ? "" : " and why their choice is not"}.`;
    fallback = quizFallback(question.explanation);
  } else {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: MODEL,
      system: SYSTEM,
      prompt,
      maxOutputTokens: 220,
    });
    const clean = text.trim();
    if (!clean) throw new Error("Empty answer");
    return NextResponse.json({ text: clean, generatedByAI: true });
  } catch (error) {
    console.error("[ai-explain] generation failed:", error);
    return NextResponse.json({ text: fallback, generatedByAI: false });
  }
}
