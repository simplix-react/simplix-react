// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useFadeTransition } from "../../crud/patterns/use-fade-transition";

describe("useFadeTransition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null displayedId when not active", () => {
    const { result } = renderHook(() =>
      useFadeTransition({ active: false, targetId: null }),
    );

    expect(result.current.displayedId).toBeNull();
    expect(result.current.fading).toBe(false);
  });

  it("returns targetId as displayedId on first selection", () => {
    const { result } = renderHook(() =>
      useFadeTransition({ active: true, targetId: "item-1" }),
    );

    expect(result.current.displayedId).toBe("item-1");
    expect(result.current.fading).toBe(false);
  });

  it("has opacity 1 when not fading", () => {
    const { result } = renderHook(() =>
      useFadeTransition({ active: true, targetId: "item-1" }),
    );

    expect(result.current.style.opacity).toBe(1);
  });

  it("fades out then swaps when targetId changes", () => {
    const { result, rerender } = renderHook(
      ({ targetId }) => useFadeTransition({ active: true, targetId, duration: 200 }),
      { initialProps: { targetId: "item-1" as string | null } },
    );

    expect(result.current.displayedId).toBe("item-1");

    rerender({ targetId: "item-2" });

    // Should be fading
    expect(result.current.fading).toBe(true);
    expect(result.current.style.opacity).toBe(0);
    // Still showing old item during fade
    expect(result.current.displayedId).toBe("item-1");

    // After duration, swap completes
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.fading).toBe(false);
    expect(result.current.displayedId).toBe("item-2");
    expect(result.current.style.opacity).toBe(1);
  });

  it("uses custom duration", () => {
    const { result, rerender } = renderHook(
      ({ targetId }) => useFadeTransition({ active: true, targetId, duration: 500 }),
      { initialProps: { targetId: "a" as string | null } },
    );

    rerender({ targetId: "b" });

    expect(result.current.fading).toBe(true);
    expect(result.current.style.transition).toBe("opacity 500ms ease-in-out");

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.fading).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.fading).toBe(false);
    expect(result.current.displayedId).toBe("b");
  });

  it("does not fade when same targetId is set", () => {
    const { result, rerender } = renderHook(
      ({ targetId }) => useFadeTransition({ active: true, targetId }),
      { initialProps: { targetId: "same" as string | null } },
    );

    rerender({ targetId: "same" });

    expect(result.current.fading).toBe(false);
    expect(result.current.displayedId).toBe("same");
  });

  it("clears displayedId when becoming inactive", () => {
    const { result, rerender } = renderHook(
      ({ active, targetId }) => useFadeTransition({ active, targetId }),
      { initialProps: { active: true, targetId: "item-1" as string | null } },
    );

    expect(result.current.displayedId).toBe("item-1");

    rerender({ active: false, targetId: null });

    expect(result.current.displayedId).toBeNull();
  });

  it("defaults duration to 200ms", () => {
    const { result } = renderHook(() =>
      useFadeTransition({ active: true, targetId: "x" }),
    );

    expect(result.current.style.transition).toBe("opacity 200ms ease-in-out");
  });
});
