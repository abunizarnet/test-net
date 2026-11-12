"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatCoins } from "@/lib/format";

interface Floater {
  id: number;
  x: number;
  y: number;
}

interface CoinProps {
  value: number;
  onTap: () => void;
}

function Face({ back = false }: { back?: boolean }) {
  return (
    <div
      className={`coin-face ${back ? "coin-back" : ""} absolute inset-0 flex items-center justify-center rounded-full border-4 border-primary/70 bg-[radial-gradient(circle_at_30%_25%,oklch(0.95_0.1_90),oklch(0.82_0.16_85)_45%,oklch(0.6_0.14_70))]`}
    >
      <div className="flex size-[78%] items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-[radial-gradient(circle_at_70%_80%,oklch(0.7_0.15_80),oklch(0.86_0.15_88))]">
        <span className="select-none text-[7rem] font-black leading-none text-primary-foreground/80 sm:text-[8rem]">
          {"\u03C0"}
        </span>
      </div>
    </div>
  );
}

export function Coin({ value, onTap }: CoinProps) {
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [hit, setHit] = useState(0);
  const nextId = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const spawn = useCallback((x: number, y: number) => {
    const id = nextId.current++;
    setFloaters((list) => [...list.slice(-11), { id, x, y }]);
    setHit((n) => n + 1);
    setTimeout(() => setFloaters((list) => list.filter((f) => f.id !== id)), 900);
  }, []);

  const handlePointer = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    onTap();
    spawn(event.clientX - rect.left, event.clientY - rect.top);
  };

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
      event.preventDefault();
      const rect = stageRef.current?.getBoundingClientRect();
      onTap();
      spawn((rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
    }
  };

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[17rem]">
      <div className="absolute inset-4 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
      <div
        className={`coin-stage absolute inset-0 ${hit === 0 ? "" : hit % 2 ? "coin-hit-a" : "coin-hit-b"}`}
      >
        <button
          type="button"
          onPointerDown={handlePointer}
          onKeyDown={handleKey}
          aria-label={`Tap the Pi coin to mine ${value} ${value === 1 ? "coin" : "coins"}`}
          className="tap-target coin-spin glow-gold absolute inset-0 cursor-pointer rounded-full outline-offset-4 focus-visible:outline-2"
        >
          <Face />
          <Face back />
        </button>
      </div>
      {floaters.map((f) => (
        <span
          key={f.id}
          aria-hidden="true"
          className="coin-float text-glow-gold absolute text-2xl font-black text-primary tabular-nums"
          style={{ left: f.x, top: f.y }}
        >
          +{formatCoins(value)}
        </span>
      ))}
    </div>
  );
}
