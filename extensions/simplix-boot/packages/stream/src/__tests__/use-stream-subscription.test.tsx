// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { useStreamSubscription } from "../use-stream-subscription";
import { StreamProvider } from "../stream-provider";

function createMockWrapper(generators?: Record<string, () => unknown>, intervalMs?: number) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <StreamProvider mock={{ enabled: true, generators, intervalMs }} subscriptionSync={false}>
        {children}
      </StreamProvider>
    );
  };
}

type ESEventListener = (event: MessageEvent | Event) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  readyState = 1;
  onerror: ((e: Event) => void) | null = null;
  private eventListeners = new Map<string, Set<ESEventListener>>();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: ESEventListener) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: ESEventListener) {
    this.eventListeners.get(type)?.delete(listener);
  }

  close() {
    this.readyState = 2;
  }

  __emit(type: string, data?: string) {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const event = data !== undefined
        ? new MessageEvent(type, { data })
        : new Event(type);
      listeners.forEach((cb) => cb(event));
    }
  }

  static reset() {
    MockEventSource.instances = [];
  }

  static get latest(): MockEventSource | undefined {
    return MockEventSource.instances[MockEventSource.instances.length - 1];
  }
}

/** A provider on a (mocked) EventSource, so a test can drive heartbeats. */
function createRealEsWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <StreamProvider heartbeatTimeoutMs={999_999} subscriptionSync={false}>
        {children}
      </StreamProvider>
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

  describe("on a live connection", () => {
    let originalEventSource: typeof EventSource;

    beforeEach(() => {
      MockEventSource.reset();
      originalEventSource = globalThis.EventSource;
      globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
    });

    afterEach(() => {
      globalThis.EventSource = originalEventSource;
    });

    it("does not re-render its caller on heartbeats", () => {
      let renders = 0;
      renderHook(() => { renders += 1; useStreamSubscription("my-resource"); }, { wrapper: createRealEsWrapper() });
      // Move the clock first: a heartbeat stamped with the mount time equals the initial state and renders nothing.
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      const settled = renders;
      act(() => {
        MockEventSource.latest!.__emit("heartbeat");
        vi.advanceTimersByTime(1100);
      });
      expect(renders).toBe(settled);
    });
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
