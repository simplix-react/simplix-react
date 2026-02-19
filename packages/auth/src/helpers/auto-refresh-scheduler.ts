import type { TokenPair } from "../types.js";

export interface AutoRefreshSchedulerOptions {
  /** Seconds before expiry to trigger refresh. Defaults to `60`. */
  refreshBeforeExpirySeconds?: number;
  /** Minimum interval between refreshes in seconds. Defaults to `30`. */
  minIntervalSeconds?: number;
  /** Called when a scheduled refresh fails. */
  onRefreshFailed?: () => void;
}

/**
 * Timer-based background token refresh scheduler.
 *
 * Schedules a refresh before the access token expires, with deduplication
 * via a minimum interval guard.
 */
export class AutoRefreshScheduler {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private lastRefreshAt = 0;

  constructor(private readonly options: AutoRefreshSchedulerOptions = {}) {}

  start(
    refreshFn: () => Promise<TokenPair>,
    getExpiresAt: () => number | null,
  ): void {
    this.stop();
    this.schedule(refreshFn, getExpiresAt);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  isRunning(): boolean {
    return this.timerId !== null;
  }

  private schedule(
    refreshFn: () => Promise<TokenPair>,
    getExpiresAt: () => number | null,
  ): void {
    const expiresAt = getExpiresAt();
    if (!expiresAt) return;

    const buffer = (this.options.refreshBeforeExpirySeconds ?? 60) * 1000;
    const minInterval = (this.options.minIntervalSeconds ?? 30) * 1000;

    const refreshAt = expiresAt - buffer;
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshAt;

    let delay = Math.max(refreshAt - now, 0);
    if (timeSinceLastRefresh < minInterval) {
      delay = Math.max(delay, minInterval - timeSinceLastRefresh);
    }

    this.timerId = setTimeout(async () => {
      this.timerId = null;
      try {
        this.lastRefreshAt = Date.now();
        await refreshFn();
        this.schedule(refreshFn, getExpiresAt);
      } catch {
        this.options.onRefreshFailed?.();
      }
    }, delay);
  }
}
