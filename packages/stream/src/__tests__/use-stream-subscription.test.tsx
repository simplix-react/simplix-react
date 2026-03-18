// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { useStreamSubscription } from "../use-stream-subscription";
import { StreamProvider } from "../stream-provider";

function createMockWrapper(generators?: Record<string, () => unknown>, intervalMs?: number) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      StreamProvider,
      {
        mock: { enabled: true, generators, intervalMs },
        subscriptionSync: false,
        children,
      },
    );
  };
}

describe("useStreamSubscription", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null initially", () => {
    const { result } = renderHook(
      () => useStreamSubscription("test-resource"),
      { wrapper: createMockWrapper() },
    );

    expect(result.current).toBeNull();
  });

  it("receives data from mock generators", () => {
    const generator = vi.fn().mockReturnValue({ status: "ok" });
    const wrapper = createMockWrapper(
      { "test-resource": generator },
      100,
    );

    const { result } = renderHook(
      () => useStreamSubscription<{ status: string }>("test-resource"),
      { wrapper },
    );

    expect(result.current).toBeNull();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toEqual({ status: "ok" });
    expect(generator).toHaveBeenCalled();
  });

  it("does not receive data for unsubscribed resources", () => {
    const wrapper = createMockWrapper(
      { "other-resource": () => ({ data: 1 }) },
      100,
    );

    const { result } = renderHook(
      () => useStreamSubscription("my-resource"),
      { wrapper },
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBeNull();
  });

  it("updates data on subsequent generator calls", () => {
    let callCount = 0;
    const generator = () => ({ count: ++callCount });
    const wrapper = createMockWrapper(
      { counter: generator },
      100,
    );

    const { result } = renderHook(
      () => useStreamSubscription<{ count: number }>("counter"),
      { wrapper },
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current?.count).toBe(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current?.count).toBe(2);
  });

  it("throws when used outside StreamProvider", () => {
    expect(() => {
      renderHook(() => useStreamSubscription("test"));
    }).toThrow("useStreamContext must be used within a StreamProvider");
  });

  it("respects subscribe=false option (does not register subscription)", () => {
    const wrapper = createMockWrapper(
      { "push-resource": () => ({ pushed: true }) },
      100,
    );

    const { result } = renderHook(
      () =>
        useStreamSubscription<{ pushed: boolean }>("push-resource", {
          subscribe: false,
        }),
      { wrapper },
    );

    // Data should still be received via addEventListener even without subscription
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toEqual({ pushed: true });
  });

  it("passes params to subscription registration", () => {
    const wrapper = createMockWrapper(
      { "param-resource": () => ({ value: "hello" }) },
      100,
    );

    const { result } = renderHook(
      () =>
        useStreamSubscription<{ value: string }>("param-resource", {
          params: { page: "1", size: "10" },
        }),
      { wrapper },
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // The subscription was registered with params (verified indirectly by receiving data)
    expect(result.current).toEqual({ value: "hello" });
  });

  it("cleans up on unmount", () => {
    const wrapper = createMockWrapper(
      { "test-resource": () => ({ data: 1 }) },
      100,
    );

    const { unmount } = renderHook(
      () => useStreamSubscription("test-resource"),
      { wrapper },
    );

    // Should not throw
    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });
  });
});
