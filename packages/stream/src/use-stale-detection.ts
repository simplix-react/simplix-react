import { useEffect, useRef, useState } from "react";
import { useStreamContext } from "./stream-provider";
import type { StalenessLevel, StalenessThresholds } from "./types";

const DEFAULT_WARNING = 5;
const DEFAULT_CRITICAL = 10;
const DEFAULT_STALE = 20;

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
  const [elapsed, setElapsed] = useState(0);
  const lastHeartbeatRef = useRef(lastHeartbeat);
  lastHeartbeatRef.current = lastHeartbeat;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - lastHeartbeatRef.current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const level = computeLevel(elapsed, thresholds);

  return { level, elapsedMs: elapsed };
}

function computeLevel(elapsedMs: number, thresholds?: StalenessThresholds): StalenessLevel {
  const seconds = elapsedMs / 1000;
  const warning = thresholds?.warningSeconds ?? DEFAULT_WARNING;
  const critical = thresholds?.criticalSeconds ?? DEFAULT_CRITICAL;
  const stale = thresholds?.staleSeconds ?? DEFAULT_STALE;
  if (seconds < warning) return "fresh";
  if (seconds < critical) return "warning";
  if (seconds < stale) return "critical";
  return "stale";
}
