const UNITS = ["", "K", "M", "B", "T", "Qa"];

export function formatCoins(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const n = Math.floor(value);
  if (n < 10_000) return n.toLocaleString("en-US");
  let unit = 0;
  let scaled = n;
  while (scaled >= 1000 && unit < UNITS.length - 1) {
    scaled /= 1000;
    unit++;
  }
  return `${scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1)}${UNITS[unit]}`;
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}
