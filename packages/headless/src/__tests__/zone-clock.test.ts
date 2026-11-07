// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRollingWindow, useZoneToday } from "../datetime/zone-clock";

const SEOUL = "Asia/Seoul";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useZoneToday", () => {
  it("is the zone's day, not the browser's or UTC's", () => {
    // 2026-11-07 23:30 UTC is already 2026-11-08 08:30 in Seoul.
    vi.setSystemTime(new Date("2026-11-07T23:30:00Z"));
    const { result } = renderHook(() => useZoneToday(SEOUL));
    expect(result.current).toEqual({ day: "2026-11-08", from: "2026-11-08T00:00:00+09:00", to: "2026-11-09T00:00:00+09:00" });
  });

  it("keeps one window through the day and moves on at the zone's midnight", () => {
    vi.setSystemTime(new Date("2026-11-08T23:58:00+09:00"));
    const { result } = renderHook(() => useZoneToday(SEOUL));
    const before = result.current;
    expect(before.day).toBe("2026-11-08");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current).toBe(before);

    act(() => {
      vi.advanceTimersByTime(61_000);
    });
    expect(result.current).toEqual({ day: "2026-11-09", from: "2026-11-09T00:00:00+09:00", to: "2026-11-10T00:00:00+09:00" });
  });

  it("moves on across a whole day with no render in between", () => {
    vi.setSystemTime(new Date("2026-11-08T09:00:00+09:00"));
    const { result } = renderHook(() => useZoneToday(SEOUL));
    act(() => {
      vi.advanceTimersByTime(30 * 60 * 60 * 1000);
    });
    expect(result.current.day).toBe("2026-11-09");
  });
});

describe("useRollingWindow", () => {
  const DAY = 24 * 60 * 60 * 1000;

  it("without a tick is the window at page open, and stays it", () => {
    vi.setSystemTime(new Date("2026-11-08T10:15:42Z"));
    const { result } = renderHook(() => useRollingWindow(DAY));
    const opened = result.current;
    expect(opened).toEqual({ from: "2026-11-07T10:15:00.000Z", to: "2026-11-08T10:15:00.000Z" });

    act(() => {
      vi.advanceTimersByTime(3 * 60 * 60 * 1000);
    });
    expect(result.current).toBe(opened);
  });

  it("two mounts inside one minute read the same window, so a pressed figure and its rows agree", () => {
    vi.setSystemTime(new Date("2026-11-08T10:15:05Z"));
    const first = renderHook(() => useRollingWindow(DAY)).result.current;
    vi.setSystemTime(new Date("2026-11-08T10:15:55Z"));
    const second = renderHook(() => useRollingWindow(DAY)).result.current;
    expect(second).toEqual(first);
  });

  it("with a tick moves on once per tick, on the tick's boundary", () => {
    vi.setSystemTime(new Date("2026-11-08T10:15:30Z"));
    const { result } = renderHook(() => useRollingWindow(DAY, { tick: 60_000 }));
    const first = result.current;
    expect(first.to).toBe("2026-11-08T10:15:00.000Z");

    act(() => {
      vi.advanceTimersByTime(29_000);
    });
    expect(result.current).toBe(first);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current).toEqual({ from: "2026-11-07T10:16:00.000Z", to: "2026-11-08T10:16:00.000Z" });

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.to).toBe("2026-11-08T10:17:00.000Z");
  });
});
