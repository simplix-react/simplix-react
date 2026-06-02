// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { useStaleDetection } from "../use-stale-detection";
import { StreamProvider } from "../stream-provider";

// ── Mock EventSource ──

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

/**
 * Create a wrapper using real EventSource (mocked) so we can control heartbeat timing.
 * The heartbeat watchdog timeout is set very high to avoid interference.
 */
function createRealEsWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      StreamProvider,
      { heartbeatTimeoutMs: 999_999, children },
    );
  };
}

describe("useStaleDetection", () => {
  let originalEventSource: typeof EventSource;

  beforeEach(() => {
    vi.useFakeTimers();
    MockEventSource.reset();
    originalEventSource = globalThis.EventSource;
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.EventSource = originalEventSource;
  });

  it("returns fresh level initially when connected", () => {
    const { result } = renderHook(() => useStaleDetection(), {
      wrapper: createRealEsWrapper(),
    });

    // Connect so lastHeartbeat is set
    const es = MockEventSource.latest!;
    act(() => {
      es.__emit("connected", JSON.stringify({ payload: { sessionId: "s1" } }));
    });

    expect(result.current.level).toBe("fresh");
    expect(result.current.elapsedMs).toBe(0);
  });

  it("transitions through staleness levels with default thresholds", () => {
    const { result } = renderHook(() => useStaleDetection(), {
      wrapper: createRealEsWrapper(),
    });

    const es = MockEventSource.latest!;
    act(() => {
      es.__emit("connected", JSON.stringify({ payload: { sessionId: "s1" } }));
    });

    expect(result.current.level).toBe("fresh");

    // After 6 seconds -> warning (default: 5s)
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(result.current.level).toBe("warning");

    // After 11 seconds total -> critical (default: 10s)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.level).toBe("critical");

    // After 21 seconds total -> stale (default: 20s)
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.level).toBe("stale");
  });

  it("uses custom thresholds when provided", () => {
    const { result } = renderHook(
      () =>
        useStaleDetection({
          warningSeconds: 2,
          criticalSeconds: 4,
          staleSeconds: 8,
        }),
      {
        wrapper: createRealEsWrapper(),
      },
    );

    const es = MockEventSource.latest!;
    act(() => {
      es.__emit("connected", JSON.stringify({ payload: { sessionId: "s1" } }));
    });

    expect(result.current.level).toBe("fresh");

    // After 3 seconds -> warning (custom: 2s)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.level).toBe("warning");

    // After 5 seconds total -> critical (custom: 4s)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.level).toBe("critical");

    // After 9 seconds total -> stale (custom: 8s)
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.level).toBe("stale");
  });

  it("throws when used outside StreamProvider", () => {
    expect(() => {
      renderHook(() => useStaleDetection());
    }).toThrow("useStreamContext must be used within a StreamProvider");
  });
});
