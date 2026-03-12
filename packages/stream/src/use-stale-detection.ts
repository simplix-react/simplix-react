import { useStreamContext } from "./stream-provider";
import { useTimestampFreshness } from "./use-timestamp-freshness";
import type { StalenessLevel, StalenessThresholds } from "./types";
import type { FreshnessThreshold } from "./use-timestamp-freshness";

const DEFAULT_THRESHOLDS: readonly FreshnessThreshold<StalenessLevel>[] = [
  { seconds: 5, level: "warning" },
  { seconds: 10, level: "critical" },
  { seconds: 20, level: "stale" },
];

/**
 * Monitor staleness of the SSE connection based on heartbeat timing.
 *
 * Default levels:
 * - fresh: <5s since last heartbeat
 * - warning: 5-10s
 * - critical: 10-20s
 * - stale: >20s
 */
export function useStaleDetection(thresholds?: StalenessThresholds): {
  level: StalenessLevel;
  elapsedMs: number;
} {
  const { lastHeartbeat } = useStreamContext();

  const resolved: readonly FreshnessThreshold<StalenessLevel>[] = thresholds
    ? [
        { seconds: thresholds.warningSeconds ?? 5, level: "warning" },
        { seconds: thresholds.criticalSeconds ?? 10, level: "critical" },
        { seconds: thresholds.staleSeconds ?? 20, level: "stale" },
      ]
    : DEFAULT_THRESHOLDS;

  return useTimestampFreshness(lastHeartbeat, resolved, "fresh");
}
