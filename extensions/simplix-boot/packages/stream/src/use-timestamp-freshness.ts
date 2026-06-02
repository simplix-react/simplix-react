import { useEffect, useRef, useState } from "react";

/** A single threshold entry: when elapsed >= seconds, the level applies. */
export interface FreshnessThreshold<L extends string> {
  readonly seconds: number;
  readonly level: L;
}

/**
 * Track elapsed time from a timestamp and resolve it to a named level.
 *
 * Polls every 1 second. Levels are evaluated in order — the last matching
 * threshold wins (i.e., thresholds should be sorted ascending by seconds).
 *
 * @param timestamp - The reference timestamp (e.g., Date.now() of last update).
 *                    Pass 0 to always return `defaultLevel` with elapsed 0.
 * @param thresholds - Ascending list of { seconds, level } entries.
 * @param defaultLevel - Level returned when elapsed is below all thresholds.
 */
export function useTimestampFreshness<L extends string>(
  timestamp: number,
  thresholds: readonly FreshnessThreshold<L>[],
  defaultLevel: L,
): { level: L; elapsedMs: number } {
  const [elapsed, setElapsed] = useState(0);
  const timestampRef = useRef(timestamp);
  timestampRef.current = timestamp;

  useEffect(() => {
    const timer = setInterval(() => {
      const ts = timestampRef.current;
      setElapsed(ts === 0 ? 0 : Date.now() - ts);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  let level = defaultLevel;
  const seconds = elapsed / 1000;
  for (const t of thresholds) {
    if (seconds >= t.seconds) {
      level = t.level;
    } else {
      break;
    }
  }

  return { level, elapsedMs: elapsed };
}
