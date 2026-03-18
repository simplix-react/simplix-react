// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  appendStreamLog,
  clearStreamLogs,
  setStreamLogEnabled,
  useStreamLogs,
} from "../stream-log";

describe("stream-log", () => {
  let rafCallbacks: FrameRequestCallback[];
  let nextRafId: number;

  beforeEach(() => {
    rafCallbacks = [];
    nextRafId = 1;

    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return nextRafId++;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});

    // Reset module state
    setStreamLogEnabled(false);
  });

  afterEach(() => {
    setStreamLogEnabled(false);
    vi.restoreAllMocks();
  });

  /** Helper: flush all pending RAF callbacks */
  function flushRaf() {
    while (rafCallbacks.length > 0) {
      const cb = rafCallbacks.shift()!;
      cb(performance.now());
    }
  }

  describe("setStreamLogEnabled", () => {
    it("enables logging when set to true", () => {
      setStreamLogEnabled(true);
      appendStreamLog({ timestamp: 1000, type: "heartbeat" });

      const { result } = renderHook(() => useStreamLogs());

      // Before RAF fires, snapshot is empty
      expect(result.current.length).toBe(0);

      act(() => flushRaf());

      expect(result.current.length).toBe(1);
      expect(result.current[0]!.type).toBe("heartbeat");
    });

    it("disables logging and clears entries when set to false", () => {
      setStreamLogEnabled(true);
      appendStreamLog({ timestamp: 1000, type: "heartbeat" });
      act(() => flushRaf());

      const { result } = renderHook(() => useStreamLogs());
      expect(result.current.length).toBe(1);

      // Disable: clears entries synchronously (via notifySync)
      act(() => {
        setStreamLogEnabled(false);
      });

      expect(result.current.length).toBe(0);
    });
  });

  describe("appendStreamLog", () => {
    it("does nothing when logging is disabled", () => {
      // logging is disabled by default after beforeEach
      appendStreamLog({ timestamp: 1000, type: "connected", summary: "test" });
      act(() => flushRaf());

      const { result } = renderHook(() => useStreamLogs());
      expect(result.current.length).toBe(0);
    });

    it("adds entries with auto-incremented id", () => {
      setStreamLogEnabled(true);
      appendStreamLog({ timestamp: 1000, type: "connected", summary: "s1" });
      appendStreamLog({ timestamp: 2000, type: "data", resource: "r1" });

      const { result } = renderHook(() => useStreamLogs());
      act(() => flushRaf());

      expect(result.current.length).toBe(2);
      // IDs should be sequential
      expect(result.current[0]!.id).toBeLessThan(result.current[1]!.id);
      expect(result.current[0]!.type).toBe("connected");
      expect(result.current[0]!.summary).toBe("s1");
      expect(result.current[1]!.type).toBe("data");
      expect(result.current[1]!.resource).toBe("r1");
    });

    it("trims entries to MAX_ENTRIES (200) when exceeded", () => {
      setStreamLogEnabled(true);

      for (let i = 0; i < 210; i++) {
        appendStreamLog({ timestamp: i, type: "heartbeat" });
      }

      const { result } = renderHook(() => useStreamLogs());
      act(() => flushRaf());

      expect(result.current.length).toBe(200);
      // The earliest entries should have been trimmed
      expect(result.current[0]!.timestamp).toBe(10);
    });

    it("batches notifications using requestAnimationFrame", () => {
      setStreamLogEnabled(true);

      // Append multiple entries before RAF fires
      appendStreamLog({ timestamp: 1000, type: "connected" });
      appendStreamLog({ timestamp: 2000, type: "data" });
      appendStreamLog({ timestamp: 3000, type: "heartbeat" });

      // RAF should have been called only once (batching: subsequent appends are skipped)
      expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);

      // Before RAF fires, snapshot is still empty
      const { result } = renderHook(() => useStreamLogs());
      expect(result.current.length).toBe(0);

      // Now fire the RAF callback
      act(() => flushRaf());

      // After RAF fires, all 3 entries should be visible
      expect(result.current.length).toBe(3);
    });
  });

  describe("clearStreamLogs", () => {
    it("clears all entries and notifies synchronously", () => {
      setStreamLogEnabled(true);
      appendStreamLog({ timestamp: 1000, type: "connected" });
      appendStreamLog({ timestamp: 2000, type: "data" });

      const { result } = renderHook(() => useStreamLogs());
      act(() => flushRaf());

      expect(result.current.length).toBe(2);

      act(() => {
        clearStreamLogs();
      });

      expect(result.current.length).toBe(0);
    });

    it("cancels pending RAF when clearing", () => {
      setStreamLogEnabled(true);
      appendStreamLog({ timestamp: 1000, type: "connected" });

      // RAF is pending but not yet fired
      expect(rafCallbacks.length).toBe(1);

      // Clear should cancel the pending RAF and notify synchronously
      act(() => {
        clearStreamLogs();
      });

      expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(1);
    });
  });

  describe("useStreamLogs", () => {
    it("returns an empty readonly array initially", () => {
      const { result } = renderHook(() => useStreamLogs());
      expect(result.current).toEqual([]);
      expect(Array.isArray(result.current)).toBe(true);
    });

    it("updates when entries are appended and RAF fires", () => {
      setStreamLogEnabled(true);

      const { result } = renderHook(() => useStreamLogs());
      expect(result.current.length).toBe(0);

      appendStreamLog({ timestamp: 1000, type: "heartbeat" });

      // Still empty before RAF fires
      expect(result.current.length).toBe(0);

      act(() => flushRaf());

      expect(result.current.length).toBe(1);
    });

    it("unsubscribes on unmount", () => {
      setStreamLogEnabled(true);

      const { unmount } = renderHook(() => useStreamLogs());

      // Should not throw after unmount
      unmount();

      appendStreamLog({ timestamp: 1000, type: "heartbeat" });
      act(() => flushRaf());
    });
  });
});
