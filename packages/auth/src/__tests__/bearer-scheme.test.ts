import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bearerScheme } from "../schemes/bearer-scheme.js";
import { memoryStore } from "../stores/memory-store.js";
import { AuthError } from "../errors.js";
import type { TokenStore } from "../types.js";

describe("bearerScheme", () => {
  let store: TokenStore;

  beforeEach(() => {
    store = memoryStore();
  });

  describe("getHeaders", () => {
    it("returns Authorization header with static token", async () => {
      const scheme = bearerScheme({ store, token: "my-token" });
      const headers = await scheme.getHeaders();
      expect(headers).toEqual({ Authorization: "Bearer my-token" });
    });

    it("returns Authorization header with function token", async () => {
      store.set("access_token", "dynamic-token");
      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
      });
      const headers = await scheme.getHeaders();
      expect(headers).toEqual({ Authorization: "Bearer dynamic-token" });
    });

    it("returns empty headers when token function returns null", async () => {
      const scheme = bearerScheme({ store, token: () => null });
      const headers = await scheme.getHeaders();
      expect(headers).toEqual({});
    });

    it("triggers proactive refresh when token is expiring soon", async () => {
      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "new-token",
        refreshToken: "new-refresh",
        expiresIn: 3600,
      });

      // Set token expiring in 10 seconds
      store.set("access_token", "old-token");
      store.set("expires_at", String(Date.now() + 10_000));

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: {
          refreshFn,
          refreshBeforeExpiry: 30, // 30 seconds buffer
        },
      });

      const headers = await scheme.getHeaders();
      expect(refreshFn).toHaveBeenCalledOnce();
      expect(store.get("access_token")).toBe("new-token");
      expect(headers).toEqual({ Authorization: "Bearer new-token" });
    });

    it("does not refresh when token is not expiring soon", async () => {
      const refreshFn = vi.fn();

      // Token expires in 10 minutes
      store.set("access_token", "valid-token");
      store.set("expires_at", String(Date.now() + 600_000));

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: {
          refreshFn,
          refreshBeforeExpiry: 30,
        },
      });

      await scheme.getHeaders();
      expect(refreshFn).not.toHaveBeenCalled();
    });

    it("proceeds with current token if proactive refresh fails", async () => {
      const refreshFn = vi.fn().mockRejectedValue(new Error("network error"));

      store.set("access_token", "old-token");
      store.set("expires_at", String(Date.now() + 10_000));

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: {
          refreshFn,
          refreshBeforeExpiry: 30,
        },
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({ Authorization: "Bearer old-token" });
    });

    it("deduplicates concurrent proactive refreshes (single-flight)", async () => {
      let resolveRefresh!: (value: unknown) => void;
      const refreshFn = vi.fn().mockImplementation(
        () => new Promise((resolve) => { resolveRefresh = resolve; }),
      );

      // Set token expiring in 10 seconds (within 30-second buffer)
      store.set("access_token", "old-token");
      store.set("expires_at", String(Date.now() + 10_000));

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: {
          refreshFn,
          refreshBeforeExpiry: 30,
        },
      });

      // Fire two concurrent getHeaders calls
      const p1 = scheme.getHeaders();
      const p2 = scheme.getHeaders();

      // Resolve the single refresh
      resolveRefresh({
        accessToken: "new-token",
        refreshToken: "new-refresh",
        expiresIn: 3600,
      });

      const [h1, h2] = await Promise.all([p1, p2]);

      // Only one refresh call should have been made
      expect(refreshFn).toHaveBeenCalledOnce();
      expect(h1).toEqual({ Authorization: "Bearer new-token" });
      expect(h2).toEqual({ Authorization: "Bearer new-token" });
    });

    it("does not proactively refresh when refreshBeforeExpiry is not set", async () => {
      const refreshFn = vi.fn();

      store.set("access_token", "token");
      store.set("expires_at", String(Date.now() + 5_000));

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: { refreshFn },
      });

      await scheme.getHeaders();
      expect(refreshFn).not.toHaveBeenCalled();
    });
  });

  describe("refresh", () => {
    it("calls refreshFn and stores the new token pair", async () => {
      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "refreshed-token",
        refreshToken: "refreshed-refresh",
        expiresIn: 7200,
      });

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: { refreshFn },
      });

      await scheme.refresh!();
      expect(store.get("access_token")).toBe("refreshed-token");
      expect(store.get("refresh_token")).toBe("refreshed-refresh");
      expect(store.get("expires_at")).toBeDefined();
    });

    it("stores token without optional fields", async () => {
      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "only-access",
      });

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: { refreshFn },
      });

      await scheme.refresh!();
      expect(store.get("access_token")).toBe("only-access");
      expect(store.get("refresh_token")).toBeNull();
      expect(store.get("expires_at")).toBeNull();
    });

    it("throws AuthError when no refresh config is provided", async () => {
      const scheme = bearerScheme({ store, token: "static" });

      await expect(scheme.refresh!()).rejects.toThrow(AuthError);
      await expect(scheme.refresh!()).rejects.toMatchObject({
        code: "REFRESH_FAILED",
      });
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when static token is provided", () => {
      const scheme = bearerScheme({ store, token: "some-token" });
      expect(scheme.isAuthenticated()).toBe(true);
    });

    it("returns false when function token returns null", () => {
      const scheme = bearerScheme({ store, token: () => null });
      expect(scheme.isAuthenticated()).toBe(false);
    });

    it("returns true when function token returns a value", () => {
      store.set("access_token", "exists");
      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
      });
      expect(scheme.isAuthenticated()).toBe(true);
    });
  });

  describe("clear", () => {
    it("removes all token-related keys from store", () => {
      store.set("access_token", "at");
      store.set("refresh_token", "rt");
      store.set("expires_at", "12345");

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
      });

      scheme.clear();
      expect(store.get("access_token")).toBeNull();
      expect(store.get("refresh_token")).toBeNull();
      expect(store.get("expires_at")).toBeNull();
    });
  });

  describe("autoSchedule", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("starts auto-refresh scheduler when autoSchedule is true", () => {
      store.set("access_token", "token");
      store.set("expires_at", String(Date.now() + 120_000));

      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "new-token",
        expiresIn: 3600,
      });

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: {
          refreshFn,
          autoSchedule: true,
          refreshBeforeExpiry: 60,
          minIntervalSeconds: 10,
        },
      });

      // Scheduler should be created and running; advance timer to trigger refresh
      vi.advanceTimersByTime(61_000);

      expect(refreshFn).toHaveBeenCalled();

      // Clean up scheduler
      scheme.clear();
    });

    it("calls onScheduledRefreshFailed when background refresh fails", async () => {
      store.set("access_token", "token");
      store.set("expires_at", String(Date.now() + 30_000));

      const onScheduledRefreshFailed = vi.fn();
      const refreshFn = vi.fn().mockRejectedValue(new Error("fail"));

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: {
          refreshFn,
          autoSchedule: true,
          refreshBeforeExpiry: 60,
          onScheduledRefreshFailed,
        },
      });

      // Advance so the scheduled refresh fires
      await vi.advanceTimersByTimeAsync(31_000);

      expect(refreshFn).toHaveBeenCalled();
      expect(onScheduledRefreshFailed).toHaveBeenCalled();

      scheme.clear();
    });

    it("stops scheduler on clear", () => {
      store.set("access_token", "token");
      store.set("expires_at", String(Date.now() + 120_000));

      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "new",
        expiresIn: 3600,
      });

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: {
          refreshFn,
          autoSchedule: true,
          refreshBeforeExpiry: 60,
        },
      });

      scheme.clear();

      // After clear, scheduler should be stopped; advancing time should not trigger refresh
      vi.advanceTimersByTime(200_000);
      expect(refreshFn).not.toHaveBeenCalled();
    });

    it("reschedules auto-refresh after manual refresh call", async () => {
      store.set("access_token", "token");
      store.set("expires_at", String(Date.now() + 120_000));

      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "refreshed",
        expiresIn: 3600,
      });

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: {
          refreshFn,
          autoSchedule: true,
          refreshBeforeExpiry: 60,
        },
      });

      // Manual refresh should call refreshFn and reschedule
      await scheme.refresh!();

      expect(refreshFn).toHaveBeenCalledOnce();
      expect(store.get("access_token")).toBe("refreshed");

      // The scheduler should have been restarted (getExpiresAt callback is wired to store)
      // Advance time to verify the scheduler picks up the new expiry
      refreshFn.mockClear();
      refreshFn.mockResolvedValue({
        accessToken: "auto-refreshed",
        expiresIn: 3600,
      });

      // expiresIn=3600 => expiresAt is ~3600s from now, refreshBeforeExpiry=60s => fires at ~3540s
      await vi.advanceTimersByTimeAsync(3541_000);

      expect(refreshFn).toHaveBeenCalled();

      scheme.clear();
    });
  });
});
