// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { resyncOnlineStatus, startOnlineStatusSync } from "../online-status-sync.js";

/** Overrides the jsdom `navigator.onLine` getter for the duration of a test. */
function setNavigatorOnLine(value: boolean): void {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
}

/** Overrides the jsdom `document.visibilityState` getter. */
function setVisibilityState(value: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => value,
  });
}

/**
 * Drives the manager into the stale-offline state the window `offline` event
 * produces, without touching `navigator.onLine`.
 */
function makeFlagStaleOffline(): void {
  onlineManager.setOnline(false);
}

describe("resyncOnlineStatus", () => {
  let stop: (() => void) | undefined;

  beforeEach(() => {
    setNavigatorOnLine(true);
    setVisibilityState("visible");
    onlineManager.setOnline(true);
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
    onlineManager.setOnline(true);
  });

  it("corrects a stale offline flag from navigator.onLine", () => {
    makeFlagStaleOffline();
    expect(onlineManager.isOnline()).toBe(false);

    expect(resyncOnlineStatus()).toBe(true);
    expect(onlineManager.isOnline()).toBe(true);
  });

  it("leaves a genuinely offline browser reporting offline", () => {
    setNavigatorOnLine(false);

    expect(resyncOnlineStatus()).toBe(false);
    expect(onlineManager.isOnline()).toBe(false);
  });

  it("pulls the manager offline when the browser went offline unnoticed", () => {
    setNavigatorOnLine(false);
    expect(onlineManager.isOnline()).toBe(true);

    expect(resyncOnlineStatus()).toBe(false);
    expect(onlineManager.isOnline()).toBe(false);
  });

  it("notifies subscribers exactly once when the flag actually changes", () => {
    const listener = vi.fn();
    const unsubscribe = onlineManager.subscribe(listener);
    makeFlagStaleOffline();
    listener.mockClear();

    resyncOnlineStatus();
    resyncOnlineStatus();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(true);
    unsubscribe();
  });

  describe("startOnlineStatusSync", () => {
    it("corrects a stale offline flag at boot", () => {
      makeFlagStaleOffline();

      stop = startOnlineStatusSync();

      expect(onlineManager.isOnline()).toBe(true);
    });

    it("corrects a stale offline flag when the document becomes visible", () => {
      stop = startOnlineStatusSync();

      setVisibilityState("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
      makeFlagStaleOffline();

      setVisibilityState("visible");
      document.dispatchEvent(new Event("visibilitychange"));

      expect(onlineManager.isOnline()).toBe(true);
    });

    it("does not resync while the document is still hidden", () => {
      stop = startOnlineStatusSync();
      makeFlagStaleOffline();

      setVisibilityState("hidden");
      document.dispatchEvent(new Event("visibilitychange"));

      expect(onlineManager.isOnline()).toBe(false);
    });

    it("leaves a genuinely offline browser offline on visibility change", () => {
      setNavigatorOnLine(false);
      stop = startOnlineStatusSync();
      expect(onlineManager.isOnline()).toBe(false);

      document.dispatchEvent(new Event("visibilitychange"));

      expect(onlineManager.isOnline()).toBe(false);
    });

    it("stops syncing after the returned cleanup runs", () => {
      const localStop = startOnlineStatusSync();
      localStop();

      makeFlagStaleOffline();
      document.dispatchEvent(new Event("visibilitychange"));

      expect(onlineManager.isOnline()).toBe(false);
    });

    it("replaces a previous registration instead of stacking listeners", () => {
      const addSpy = vi.spyOn(document, "addEventListener");
      const removeSpy = vi.spyOn(document, "removeEventListener");

      const first = startOnlineStatusSync();
      stop = startOnlineStatusSync();

      expect(addSpy).toHaveBeenCalledTimes(2);
      expect(removeSpy).toHaveBeenCalledTimes(1);

      // The first handle is already detached, so calling it is harmless.
      first();
      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe("recovery of a paused query", () => {
    it("resumes a paused fetch once the flag is repaired", async () => {
      makeFlagStaleOffline();

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      queryClient.mount();

      const queryFn = vi.fn().mockResolvedValue("rows");
      const fetched = queryClient.fetchQuery({ queryKey: ["rows"], queryFn });

      await vi.waitFor(() => {
        expect(queryClient.getQueryState(["rows"])?.fetchStatus).toBe("paused");
      });
      expect(queryFn).not.toHaveBeenCalled();

      resyncOnlineStatus();

      await expect(fetched).resolves.toBe("rows");
      expect(queryFn).toHaveBeenCalledTimes(1);

      queryClient.unmount();
      queryClient.clear();
    });
  });
});
