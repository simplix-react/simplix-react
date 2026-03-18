// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useTimestampFreshness } from "../use-timestamp-freshness";
import type { FreshnessThreshold } from "../use-timestamp-freshness";

describe("useTimestampFreshness", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const thresholds: readonly FreshnessThreshold<"fresh" | "warning" | "stale">[] = [
    { seconds: 5, level: "warning" },
    { seconds: 15, level: "stale" },
  ];

  it("returns defaultLevel and 0 elapsed initially", () => {
    const now = Date.now();
    const { result } = renderHook(() =>
      useTimestampFreshness(now, thresholds, "fresh"),
    );

    expect(result.current.level).toBe("fresh");
    expect(result.current.elapsedMs).toBe(0);
  });

  it("returns defaultLevel with elapsed 0 when timestamp is 0", () => {
    const { result } = renderHook(() =>
      useTimestampFreshness(0, thresholds, "fresh"),
    );

    // Advance time - should still be 0 because timestamp=0 is special
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.level).toBe("fresh");
    expect(result.current.elapsedMs).toBe(0);
  });

  it("transitions to warning level after threshold", () => {
    const now = Date.now();
    const { result } = renderHook(() =>
      useTimestampFreshness(now, thresholds, "fresh"),
    );

    // Advance past the warning threshold (5 seconds)
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(result.current.level).toBe("warning");
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(5000);
  });

  it("transitions to stale level after higher threshold", () => {
    const now = Date.now();
    const { result } = renderHook(() =>
      useTimestampFreshness(now, thresholds, "fresh"),
    );

    // Advance past the stale threshold (15 seconds)
    act(() => {
      vi.advanceTimersByTime(16000);
    });

    expect(result.current.level).toBe("stale");
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(15000);
  });

  it("resets level when timestamp is updated", () => {
    let timestamp = Date.now();
    const { result, rerender } = renderHook(
      ({ ts }) => useTimestampFreshness(ts, thresholds, "fresh"),
      { initialProps: { ts: timestamp } },
    );

    // Advance past warning
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(result.current.level).toBe("warning");

    // Update the timestamp to "now"
    timestamp = Date.now();
    rerender({ ts: timestamp });

    // After the next tick, the elapsed should be close to 0 again
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.level).toBe("fresh");
  });

  it("works with empty thresholds (always returns default level)", () => {
    const now = Date.now();
    const { result } = renderHook(() =>
      useTimestampFreshness(now, [], "ok"),
    );

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.level).toBe("ok");
  });

  it("breaks early when thresholds are sorted ascending and elapsed is below", () => {
    const now = Date.now();
    const sorted: readonly FreshnessThreshold<string>[] = [
      { seconds: 5, level: "a" },
      { seconds: 10, level: "b" },
      { seconds: 20, level: "c" },
    ];

    const { result } = renderHook(() =>
      useTimestampFreshness(now, sorted, "default"),
    );

    // Advance 7 seconds - should be "a" (past 5s but not 10s)
    act(() => {
      vi.advanceTimersByTime(7000);
    });

    expect(result.current.level).toBe("a");
  });

  it("cleans up interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const now = Date.now();

    const { unmount } = renderHook(() =>
      useTimestampFreshness(now, thresholds, "fresh"),
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
