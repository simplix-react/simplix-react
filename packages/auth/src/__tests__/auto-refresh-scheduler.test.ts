import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AutoRefreshScheduler } from "../helpers/auto-refresh-scheduler.js";
import type { TokenPair } from "../types.js";

describe("AutoRefreshScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createRefreshFn() {
    return vi.fn<[], Promise<TokenPair>>().mockResolvedValue({
      accessToken: "new-token",
      refreshToken: "new-refresh",
      expiresIn: 3600,
    });
  }

  describe("start", () => {
    it("schedules a refresh before token expiry", async () => {
      const scheduler = new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: 60,
      });
      const refreshFn = createRefreshFn();

      // Token expires in 5 minutes
      const expiresAt = Date.now() + 5 * 60 * 1000;
      scheduler.start(refreshFn, () => expiresAt);

      expect(scheduler.isRunning()).toBe(true);

      // Advance to just before the scheduled refresh (5min - 60s = 4min)
      await vi.advanceTimersByTimeAsync(4 * 60 * 1000 - 1);
      expect(refreshFn).not.toHaveBeenCalled();

      // Advance past the refresh point
      await vi.advanceTimersByTimeAsync(2);
      expect(refreshFn).toHaveBeenCalledOnce();
    });

    it("refreshes immediately when token is already within buffer", async () => {
      const scheduler = new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: 60,
      });
      const refreshFn = createRefreshFn();

      // Token expires in 30 seconds (within 60s buffer)
      const expiresAt = Date.now() + 30 * 1000;
      scheduler.start(refreshFn, () => expiresAt);

      // Delay is 0 since refreshAt (expiresAt - 60s) is already in the past
      await vi.advanceTimersByTimeAsync(0);
      expect(refreshFn).toHaveBeenCalledOnce();
    });

    it("stops previous timer when start is called again", async () => {
      const scheduler = new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: 60,
      });
      const refreshFn1 = createRefreshFn();
      const refreshFn2 = createRefreshFn();

      const expiresAt = Date.now() + 5 * 60 * 1000;
      scheduler.start(refreshFn1, () => expiresAt);
      scheduler.start(refreshFn2, () => expiresAt);

      // Advance to trigger
      await vi.advanceTimersByTimeAsync(4 * 60 * 1000);
      expect(refreshFn1).not.toHaveBeenCalled();
      expect(refreshFn2).toHaveBeenCalledOnce();
    });
  });

  describe("stop", () => {
    it("cancels a scheduled refresh", async () => {
      const scheduler = new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: 60,
      });
      const refreshFn = createRefreshFn();

      const expiresAt = Date.now() + 5 * 60 * 1000;
      scheduler.start(refreshFn, () => expiresAt);

      expect(scheduler.isRunning()).toBe(true);

      scheduler.stop();

      expect(scheduler.isRunning()).toBe(false);

      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
      expect(refreshFn).not.toHaveBeenCalled();
    });

    it("is safe to call stop when not running", () => {
      const scheduler = new AutoRefreshScheduler();

      expect(() => scheduler.stop()).not.toThrow();
      expect(scheduler.isRunning()).toBe(false);
    });
  });

  describe("isRunning", () => {
    it("returns false initially", () => {
      const scheduler = new AutoRefreshScheduler();

      expect(scheduler.isRunning()).toBe(false);
    });

    it("returns true after start", () => {
      const scheduler = new AutoRefreshScheduler();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      scheduler.start(createRefreshFn(), () => expiresAt);

      expect(scheduler.isRunning()).toBe(true);
    });

    it("returns false after stop", () => {
      const scheduler = new AutoRefreshScheduler();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      scheduler.start(createRefreshFn(), () => expiresAt);
      scheduler.stop();

      expect(scheduler.isRunning()).toBe(false);
    });
  });

  describe("no expiry", () => {
    it("does not schedule when getExpiresAt returns null", () => {
      const scheduler = new AutoRefreshScheduler();
      const refreshFn = createRefreshFn();

      scheduler.start(refreshFn, () => null);

      expect(scheduler.isRunning()).toBe(false);
    });
  });

  describe("reschedule after refresh", () => {
    it("schedules the next refresh after a successful refresh", async () => {
      const scheduler = new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: 60,
        minIntervalSeconds: 0,
      });

      let expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes
      const refreshFn = vi.fn<[], Promise<TokenPair>>().mockImplementation(async () => {
        // After refresh, token expires in another 2 minutes from "now"
        expiresAt = Date.now() + 2 * 60 * 1000;
        return { accessToken: "new", expiresIn: 120 };
      });

      scheduler.start(refreshFn, () => expiresAt);

      // First refresh at 1 minute (2min - 60s buffer)
      await vi.advanceTimersByTimeAsync(60 * 1000);
      expect(refreshFn).toHaveBeenCalledOnce();

      // Second refresh should be scheduled for another minute
      await vi.advanceTimersByTimeAsync(60 * 1000);
      expect(refreshFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("min interval", () => {
    it("respects minimum interval between refreshes", async () => {
      const scheduler = new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: 60,
        minIntervalSeconds: 30,
      });

      let expiresAt = Date.now() + 30 * 1000; // Expires in 30s
      const refreshFn = vi.fn<[], Promise<TokenPair>>().mockImplementation(async () => {
        // After refresh, expires in another 30s
        expiresAt = Date.now() + 30 * 1000;
        return { accessToken: "new", expiresIn: 30 };
      });

      scheduler.start(refreshFn, () => expiresAt);

      // First refresh fires immediately (30s - 60s buffer = already past)
      await vi.advanceTimersByTimeAsync(0);
      expect(refreshFn).toHaveBeenCalledOnce();

      // Next refresh should be delayed by minInterval (30s)
      await vi.advanceTimersByTimeAsync(29 * 1000);
      expect(refreshFn).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(2 * 1000);
      expect(refreshFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("refresh failure", () => {
    it("calls onRefreshFailed when refresh throws", async () => {
      const onRefreshFailed = vi.fn();
      const scheduler = new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: 60,
        onRefreshFailed,
      });

      const refreshFn = vi.fn().mockRejectedValue(new Error("network error"));
      const expiresAt = Date.now() + 30 * 1000;
      scheduler.start(refreshFn, () => expiresAt);

      await vi.advanceTimersByTimeAsync(0);
      expect(onRefreshFailed).toHaveBeenCalledOnce();
    });

    it("stops scheduling after refresh failure", async () => {
      const scheduler = new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: 60,
      });

      const refreshFn = vi.fn().mockRejectedValue(new Error("fail"));
      const expiresAt = Date.now() + 30 * 1000;
      scheduler.start(refreshFn, () => expiresAt);

      await vi.advanceTimersByTimeAsync(0);

      expect(scheduler.isRunning()).toBe(false);
    });
  });

  describe("default options", () => {
    it("uses 60s buffer and 30s min interval by default", async () => {
      const scheduler = new AutoRefreshScheduler();
      const refreshFn = createRefreshFn();

      // Token expires in 90 seconds
      const expiresAt = Date.now() + 90 * 1000;
      scheduler.start(refreshFn, () => expiresAt);

      // Refresh should fire at 30s (90s - 60s buffer)
      await vi.advanceTimersByTimeAsync(29 * 1000);
      expect(refreshFn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(2 * 1000);
      expect(refreshFn).toHaveBeenCalledOnce();
    });
  });
});
