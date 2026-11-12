"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { pi } from "@/lib/pi";
import { usePiAuth } from "@/contexts/pi-auth-context";
import {
  EMPTY_LEVELS,
  MAX_LEVEL,
  QUIZ_COMPLETION_REWARD,
  QUIZ_CORRECT_REWARD,
  UPGRADES,
  miningRate,
  pendingCoins,
  sanitizeLevels,
  tapValue,
  upgradeCost,
  type Levels,
  type UpgradeId,
} from "@/lib/game-config";
import { questionsForDay, utcDayKey } from "@/lib/quiz-data";

const SAVE_KEY = "save";
const SAVE_DELAY_MS = 6000;
const SYNC_INTERVAL_MS = 20000;

export interface QuizProgress {
  day: string;
  answers: number[];
  done: boolean;
}

export interface GameState {
  coins: number;
  totalMined: number;
  levels: Levels;
  lastCollectAt: number;
  quiz: QuizProgress;
}

type Action =
  | { type: "load"; state: GameState }
  | { type: "tap" }
  | { type: "collect"; now: number }
  | { type: "buy"; id: UpgradeId }
  | { type: "quiz"; day: string; selected: number };

function freshQuiz(day: string): QuizProgress {
  return { day, answers: [], done: false };
}

function freshState(now: number): GameState {
  return {
    coins: 0,
    totalMined: 0,
    levels: { ...EMPTY_LEVELS },
    lastCollectAt: now,
    quiz: freshQuiz(utcDayKey(now)),
  };
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback;
}

function parseSave(blob: Record<string, unknown>, now: number): GameState {
  const quizRaw = (typeof blob.quiz === "object" && blob.quiz !== null ? blob.quiz : {}) as Record<
    string,
    unknown
  >;
  const answers = Array.isArray(quizRaw.answers)
    ? quizRaw.answers.filter((a): a is number => typeof a === "number" && a >= 0 && a < 8)
    : [];
  const day = typeof quizRaw.day === "string" ? quizRaw.day : utcDayKey(now);
  return {
    coins: num(blob.coins, 0),
    totalMined: num(blob.totalMined, 0),
    levels: sanitizeLevels(blob.levels),
    lastCollectAt: Math.min(num(blob.lastCollectAt, now), now),
    quiz: { day, answers, done: quizRaw.done === true },
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "load":
      return action.state;
    case "tap": {
      const value = tapValue(state.levels);
      return { ...state, coins: state.coins + value, totalMined: state.totalMined + value };
    }
    case "collect": {
      const amount = pendingCoins(miningRate(state.levels), state.lastCollectAt, action.now);
      if (amount <= 0) return { ...state, lastCollectAt: action.now };
      return {
        ...state,
        coins: state.coins + amount,
        totalMined: state.totalMined + amount,
        lastCollectAt: action.now,
      };
    }
    case "buy": {
      const def = UPGRADES.find((u) => u.id === action.id);
      if (!def) return state;
      const level = state.levels[def.id];
      if (level >= MAX_LEVEL) return state;
      const cost = upgradeCost(def, level);
      if (state.coins < cost) return state;
      const now = Date.now();
      // Bank pending passive coins at the old rate so a purchase never rewrites past earnings.
      const banked = pendingCoins(miningRate(state.levels), state.lastCollectAt, now);
      return {
        ...state,
        coins: state.coins - cost + banked,
        totalMined: state.totalMined + banked,
        lastCollectAt: now,
        levels: { ...state.levels, [def.id]: level + 1 },
      };
    }
    case "quiz": {
      const questions = questionsForDay(action.day);
      const quiz = state.quiz.day === action.day ? state.quiz : freshQuiz(action.day);
      if (quiz.done || quiz.answers.length >= questions.length) return state;
      const question = questions[quiz.answers.length];
      let reward = action.selected === question.answerIndex ? QUIZ_CORRECT_REWARD : 0;
      const answers = [...quiz.answers, action.selected];
      const done = answers.length >= questions.length;
      if (done) reward += QUIZ_COMPLETION_REWARD;
      return {
        ...state,
        coins: state.coins + reward,
        quiz: { day: action.day, answers, done },
      };
    }
    default:
      return state;
  }
}

export type LoadStatus = "loading" | "ready" | "error";
export type SaveStatus = "saved" | "pending" | "retrying";
export type SyncStatus = "idle" | "synced" | "unavailable";

interface GameContextValue {
  state: GameState;
  loadStatus: LoadStatus;
  saveStatus: SaveStatus;
  syncStatus: SyncStatus;
  tapAmount: number;
  rate: number;
  tap: () => void;
  collect: () => void;
  buy: (id: UpgradeId) => void;
  answerQuiz: (selected: number) => void;
  retryLoad: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function serialize(state: GameState): Record<string, unknown> {
  return {
    coins: state.coins,
    totalMined: state.totalMined,
    levels: state.levels,
    lastCollectAt: state.lastCollectAt,
    quiz: state.quiz,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = usePiAuth();
  const [state, dispatch] = useReducer(reducer, undefined, () => freshState(Date.now()));
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [loadAttempt, setLoadAttempt] = useState(0);

  const stateRef = useRef(state);
  stateRef.current = state;
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failuresRef = useRef(0);
  const savingRef = useRef(false);
  const syncedTotalRef = useRef(-1);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadStatus("loading");
    pi.userState
      .get(SAVE_KEY)
      .then((record) => {
        if (cancelled) return;
        const now = Date.now();
        dispatch({
          type: "load",
          state: record ? parseSave(record.blob, now) : freshState(now),
        });
        setLoadStatus("ready");
      })
      .catch((error) => {
        console.error("[game] Failed to load saved progress:", error);
        if (!cancelled) setLoadStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const flushSave = useCallback(async () => {
    saveTimerRef.current = null;
    if (!dirtyRef.current || savingRef.current) return;
    savingRef.current = true;
    dirtyRef.current = false;
    try {
      await pi.userState.set(SAVE_KEY, serialize(stateRef.current));
      failuresRef.current = 0;
      setSaveStatus(dirtyRef.current ? "pending" : "saved");
    } catch (error) {
      console.error("[game] Saving progress failed:", error);
      dirtyRef.current = true;
      failuresRef.current += 1;
      setSaveStatus("retrying");
    } finally {
      savingRef.current = false;
      if (dirtyRef.current && !saveTimerRef.current) {
        const backoff = SAVE_DELAY_MS * Math.min(8, 2 ** failuresRef.current);
        saveTimerRef.current = setTimeout(flushSave, failuresRef.current ? backoff : SAVE_DELAY_MS);
      }
    }
  }, []);

  useEffect(() => {
    if (loadStatus !== "ready") return;
    dirtyRef.current = true;
    setSaveStatus((s) => (s === "retrying" ? s : "pending"));
    if (!saveTimerRef.current && !savingRef.current) {
      saveTimerRef.current = setTimeout(flushSave, SAVE_DELAY_MS);
    }
  }, [state, loadStatus, flushSave]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && dirtyRef.current && loadStatus === "ready") {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        void flushSave();
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flushSave, loadStatus]);

  const submitLeaderboard = useCallback(async () => {
    const total = stateRef.current.totalMined;
    if (total <= 0 || total === syncedTotalRef.current) return;
    if (typeof window === "undefined" || !window.Pi) {
      setSyncStatus("unavailable");
      return;
    }
    try {
      if (!accessTokenRef.current) {
        const auth = await window.Pi.authenticate(["username", "payments"], () => {});
        accessTokenRef.current = auth.accessToken;
      }
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: accessTokenRef.current, total }),
      });
      if (response.status === 401) {
        accessTokenRef.current = null;
        setSyncStatus("unavailable");
        return;
      }
      if (!response.ok) throw new Error(`Leaderboard responded ${response.status}`);
      syncedTotalRef.current = total;
      setSyncStatus("synced");
    } catch (error) {
      console.error("[game] Leaderboard update failed:", error);
      accessTokenRef.current = null;
      setSyncStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    if (loadStatus !== "ready" || !user) return;
    const first = setTimeout(() => void submitLeaderboard(), 2500);
    const interval = setInterval(() => void submitLeaderboard(), SYNC_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [loadStatus, user, submitLeaderboard]);

  const tap = useCallback(() => dispatch({ type: "tap" }), []);
  const collect = useCallback(() => dispatch({ type: "collect", now: Date.now() }), []);
  const buy = useCallback((id: UpgradeId) => dispatch({ type: "buy", id }), []);
  const answerQuiz = useCallback(
    (selected: number) => dispatch({ type: "quiz", day: utcDayKey(Date.now()), selected }),
    [],
  );
  const retryLoad = useCallback(() => setLoadAttempt((n) => n + 1), []);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      loadStatus,
      saveStatus,
      syncStatus,
      tapAmount: tapValue(state.levels),
      rate: miningRate(state.levels),
      tap,
      collect,
      buy,
      answerQuiz,
      retryLoad,
    }),
    [state, loadStatus, saveStatus, syncStatus, tap, collect, buy, answerQuiz, retryLoad],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
}
