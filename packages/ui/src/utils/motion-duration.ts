/** Parses a CSS time token (`200ms`, `0.2s`) to milliseconds; anything unreadable is 0. */
export function readDuration(value: string): number {
  const text = value.trim();
  if (text.endsWith("ms")) return Number.parseFloat(text) || 0;
  if (text.endsWith("s")) return (Number.parseFloat(text) || 0) * 1000;
  return 0;
}

/**
 * The milliseconds a motion token (`--dur-fast`, `--dur-base`, `--dur-slow`) resolves to on an
 * element, the document root by default. Reduced motion sets the tokens to 0, so a caller timing a
 * swap by it swaps at once.
 */
export function motionTokenMs(token: `--${string}`, element?: Element | null): number {
  if (typeof window === "undefined") return 0;
  const target = element ?? document.documentElement;
  return readDuration(getComputedStyle(target).getPropertyValue(token));
}
