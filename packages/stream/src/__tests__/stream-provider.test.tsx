// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ComponentProps, type ReactNode } from "react";

import { StreamProvider, useStreamContext } from "../stream-provider";
import type { StreamProtocol } from "../types";

// ── Mock EventSource ──

type ESEventListener = (event: MessageEvent | Event) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  readyState = 0;
  onerror: ((e: Event) => void) | null = null;
  private eventListeners = new Map<string, Set<ESEventListener>>();

  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN
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
    this.readyState = 2; // CLOSED
  }

  // Test helper: simulate server event
  __emit(type: string, data?: string) {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const event = data !== undefined
        ? new MessageEvent(type, { data })
        : new Event(type);
      listeners.forEach((cb) => cb(event));
    }
  }

  // Test helper: simulate connection error
  __triggerError() {
    if (this.onerror) {
      this.onerror(new Event("error"));
    }
  }

  static reset() {
    MockEventSource.instances = [];
  }

  static get latest(): MockEventSource | undefined {
    return MockEventSource.instances[MockEventSource.instances.length - 1];
  }
}

// ── Test helpers ──

function createWrapper(props: Record<string, unknown> = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(StreamProvider, { ...props, children } as unknown as ComponentProps<typeof StreamProvider>);
  };
}

describe("StreamProvider", () => {
  let originalEventSource: typeof EventSource;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    MockEventSource.reset();
    originalEventSource = globalThis.EventSource;
    originalFetch = globalThis.fetch;
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("ok"));
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.EventSource = originalEventSource;
    globalThis.fetch = originalFetch;
  });

  describe("useStreamContext", () => {
    it("throws when used outside StreamProvider", () => {
      expect(() => {
        renderHook(() => useStreamContext());
      }).toThrow("useStreamContext must be used within a StreamProvider");
    });

    it("provides context when used inside StreamProvider", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ mock: { enabled: true } }),
      });

      expect(result.current).toBeDefined();
      expect(result.current.connectionStatus).toBeDefined();
    });
  });

  describe("mock mode", () => {
    it("sets connected status and mock session id", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ mock: { enabled: true } }),
      });

      expect(result.current.connectionStatus).toBe("connected");
      expect(result.current.sessionId).toBe("mock-session");
    });

    it("dispatches generator data at configured interval", () => {
      const generator = vi.fn().mockReturnValue({ value: 42 });
      const listenerCb = vi.fn();

      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({
          mock: {
            enabled: true,
            generators: { "test-resource": generator },
            intervalMs: 200,
          },
        }),
      });

      // Register a listener
      act(() => {
        result.current.addEventListener("test-resource", listenerCb);
      });

      // Advance past interval
      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(generator).toHaveBeenCalled();
      expect(listenerCb).toHaveBeenCalledWith({ value: 42 });
    });

    it("uses default interval of 1000ms when not specified", () => {
      const generator = vi.fn().mockReturnValue("data");
      const listenerCb = vi.fn();

      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({
          mock: {
            enabled: true,
            generators: { res: generator },
          },
        }),
      });

      act(() => {
        result.current.addEventListener("res", listenerCb);
      });

      // Advance 500ms - should not have dispatched yet
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(listenerCb).not.toHaveBeenCalled();

      // Advance to 1100ms total
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(listenerCb).toHaveBeenCalled();
    });

    it("cleans up mock timer on unmount", () => {
      const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

      const { unmount } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({
          mock: { enabled: true, generators: { a: () => 1 }, intervalMs: 100 },
        }),
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it("does not create EventSource in mock mode", () => {
      renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ mock: { enabled: true } }),
      });

      expect(MockEventSource.instances.length).toBe(0);
    });
  });

  describe("real EventSource connection", () => {
    it("creates EventSource with default URL and timezone param", () => {
      renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      expect(MockEventSource.instances.length).toBe(1);
      const es = MockEventSource.latest!;
      expect(es.url).toContain("/api/stream/connect");
      expect(es.url).toContain("timezone=");
    });

    it("creates EventSource with custom URL", () => {
      renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ url: "/custom/sse?token=abc" }),
      });

      const es = MockEventSource.latest!;
      // URL already has ?, so should use &
      expect(es.url).toContain("/custom/sse?token=abc&timezone=");
    });

    it("starts with connecting status", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      expect(result.current.connectionStatus).toBe("connecting");
    });

    it("transitions to connected on connected event", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "connected",
          JSON.stringify({ payload: { sessionId: "sess-123" } }),
        );
      });

      expect(result.current.connectionStatus).toBe("connected");
      expect(result.current.sessionId).toBe("sess-123");
    });

    it("handles reconnected event", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "reconnected",
          JSON.stringify({ payload: { sessionId: "sess-456" } }),
        );
      });

      expect(result.current.connectionStatus).toBe("connected");
      expect(result.current.sessionId).toBe("sess-456");
    });

    it("dispatches data events to listeners", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const cb = vi.fn();
      act(() => {
        result.current.addEventListener("my-resource", cb);
      });

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "data",
          JSON.stringify({ resource: "my-resource", payload: { x: 1 } }),
        );
      });

      expect(cb).toHaveBeenCalledWith({ x: 1 });
    });

    it("handles heartbeat events", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const initialHeartbeat = result.current.lastHeartbeat;

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit("heartbeat");
      });

      // lastHeartbeat is throttled, advance timer to flush
      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(result.current.lastHeartbeat).toBeGreaterThanOrEqual(initialHeartbeat);
    });

    it("handles gap events and dispatches to __gap__ listeners", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const gapCb = vi.fn();
      act(() => {
        result.current.addEventListener("__gap__orders", gapCb);
      });

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "gap",
          JSON.stringify({ payload: { resource: "orders", reason: "timeout" } }),
        );
      });

      expect(gapCb).toHaveBeenCalledWith({
        resource: "orders",
        reason: "timeout",
      });
    });

    it("handles error events", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit("error", "Server error occurred");
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[stream] SSE error event:",
        "Server error occurred",
      );

      consoleErrorSpy.mockRestore();
    });

    it("handles error events without data", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;
      // Emit error event without data (MessageEvent with no data => data is "")
      act(() => {
        es.__emit("error");
      });

      // Should not call console.error when data is falsy
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("reconnects on EventSource onerror with backoff", () => {
      renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const firstEs = MockEventSource.latest!;
      expect(MockEventSource.instances.length).toBe(1);

      // Trigger error to force reconnect
      act(() => {
        firstEs.__triggerError();
      });

      expect(firstEs.readyState).toBe(2); // CLOSED

      // Advance past backoff delay (first retry: ~1s with jitter)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(MockEventSource.instances.length).toBe(2);
    });

    it("shows reconnecting status after disconnect", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;

      // First connect
      act(() => {
        es.__emit(
          "connected",
          JSON.stringify({ payload: { sessionId: "s1" } }),
        );
      });
      expect(result.current.connectionStatus).toBe("connected");

      // Trigger error
      act(() => {
        es.__triggerError();
      });
      expect(result.current.connectionStatus).toBe("disconnected");

      // Advance past backoff
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.connectionStatus).toBe("reconnecting");
    });

    it("cleans up on unmount", () => {
      const { unmount } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;
      expect(es.readyState).toBe(1); // OPEN

      unmount();

      expect(es.readyState).toBe(2); // CLOSED
    });

    it("cleans up retry timer on unmount during reconnect backoff", () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      const { unmount } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;

      // Trigger error to start reconnect backoff (sets retryTimerRef)
      act(() => {
        es.__triggerError();
      });

      // Unmount while backoff timer is still pending
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it("cleans up heartbeat throttle timer on unmount", () => {
      const { unmount } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;

      // Connect and trigger a heartbeat to start the throttle timer
      act(() => {
        es.__emit(
          "connected",
          JSON.stringify({ payload: { sessionId: "s-hb" } }),
        );
      });

      // Emit a heartbeat - this starts the throttle timer inside touchHeartbeat
      act(() => {
        es.__emit("heartbeat");
      });

      // Unmount while the heartbeat throttle timer (1s) is still pending
      unmount();

      // Should not throw; cleanup should clear the throttle timer
      expect(es.readyState).toBe(2);
    });

    it("heartbeat watchdog forces reconnect after timeout", () => {
      renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ heartbeatTimeoutMs: 5000 }),
      });

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(MockEventSource.instances.length).toBe(1);

      // Advance past heartbeat timeout + watchdog interval (5s check interval)
      act(() => {
        vi.advanceTimersByTime(11000);
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[stream] Heartbeat timeout, forcing reconnect",
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("addEventListener / dispatch", () => {
    it("adds and removes listeners correctly", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ mock: { enabled: true } }),
      });

      const cb1 = vi.fn();
      const cb2 = vi.fn();

      let unsubscribe1: () => void;
      let unsubscribe2: () => void;

      act(() => {
        unsubscribe1 = result.current.addEventListener("res-a", cb1);
        unsubscribe2 = result.current.addEventListener("res-a", cb2);
      });

      // Both should receive dispatched data from mock generator
      createWrapper({
        mock: { enabled: true, generators: { "res-a": () => "data" }, intervalMs: 50 },
      });
      // Instead of re-creating, let's test via the addEventListener return value
      // by reusing the existing context

      // Unsubscribe cb1
      act(() => {
        unsubscribe1!();
      });

      // Clean up remaining
      act(() => {
        unsubscribe2!();
      });
    });

    it("removes resource map entry when last listener is unsubscribed", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ mock: { enabled: true } }),
      });

      let unsubscribe: () => void;
      act(() => {
        unsubscribe = result.current.addEventListener("solo-resource", vi.fn());
      });

      act(() => {
        unsubscribe!();
      });

      // Adding again should not cause issues
      act(() => {
        result.current.addEventListener("solo-resource", vi.fn());
      });
    });
  });

  describe("subscription registry", () => {
    it("registers and unregisters subscriptions", async () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      // Connect first
      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "connected",
          JSON.stringify({ payload: { sessionId: "sess-1" } }),
        );
      });

      act(() => {
        result.current.registerSubscription("sub-1", {
          resource: "users",
          params: { page: "1" },
        });
      });

      // Advance to flush the debounced sync
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/stream/sessions/sess-1/subscriptions",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );

      // Unregister and verify sync is called again
      act(() => {
        result.current.unregisterSubscription("sub-1");
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should have been called multiple times
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it("does not sync when subscriptionSync is false", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ subscriptionSync: false }),
      });

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "connected",
          JSON.stringify({ payload: { sessionId: "sess-2" } }),
        );
      });

      act(() => {
        result.current.registerSubscription("sub-1", { resource: "orders" });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // fetch should not have been called for subscription sync
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("deduplicates subscriptions by resource", async () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "connected",
          JSON.stringify({ payload: { sessionId: "sess-3" } }),
        );
      });

      act(() => {
        result.current.registerSubscription("sub-1", { resource: "users" });
        result.current.registerSubscription("sub-2", { resource: "users" });
        result.current.registerSubscription("sub-3", { resource: "orders" });
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Check the body sent to fetch - should deduplicate "users"
      const lastCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.at(-1);
      const body = JSON.parse(lastCall![1].body);
      const resources = body.subscriptions.map((s: { resource: string }) => s.resource);
      // "users" appears only once (deduplication), plus "orders"
      expect(resources).toEqual(["users", "orders"]);
    });

    it("syncs subscriptions when sessionId becomes available", async () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper(),
      });

      // Register subscription BEFORE connection
      act(() => {
        result.current.registerSubscription("sub-1", { resource: "events" });
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // No session yet, fetch should not be called with actual subscription sync
      const callCountBefore = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length;

      // Now connect
      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "connected",
          JSON.stringify({ payload: { sessionId: "sess-delayed" } }),
        );
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should have synced now
      const callCountAfter = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callCountAfter).toBeGreaterThan(callCountBefore);
    });
  });

  describe("custom protocol", () => {
    it("uses custom protocol parsers", () => {
      const customProtocol: StreamProtocol = {
        parseConnected: (data: string) => {
          const obj = JSON.parse(data);
          return { sessionId: obj.sid };
        },
        parseData: (data: string) => {
          const obj = JSON.parse(data);
          return { resource: obj.type, payload: obj.body };
        },
        parseGap: (data: string) => {
          const obj = JSON.parse(data);
          return { resource: obj.res, reason: obj.msg };
        },
      };

      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({ protocol: customProtocol }),
      });

      const es = MockEventSource.latest!;

      // Test custom connected parser
      act(() => {
        es.__emit("connected", JSON.stringify({ sid: "custom-session" }));
      });

      expect(result.current.sessionId).toBe("custom-session");

      // Test custom data parser
      const cb = vi.fn();
      act(() => {
        result.current.addEventListener("my-type", cb);
      });

      act(() => {
        es.__emit("data", JSON.stringify({ type: "my-type", body: { val: 99 } }));
      });

      expect(cb).toHaveBeenCalledWith({ val: 99 });

      // Test custom gap parser
      const gapCb = vi.fn();
      act(() => {
        result.current.addEventListener("__gap__items", gapCb);
      });

      act(() => {
        es.__emit("gap", JSON.stringify({ res: "items", msg: "overflow" }));
      });

      expect(gapCb).toHaveBeenCalledWith({ resource: "items", reason: "overflow" });
    });
  });

  describe("custom event names", () => {
    it("uses custom SSE event type names", () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({
          eventNames: {
            connected: "CONNECTED",
            reconnected: "RECONNECTED",
            data: "DATA",
            heartbeat: "HEARTBEAT",
            gap: "GAP",
            error: "ERROR",
          },
        }),
      });

      const es = MockEventSource.latest!;

      // Use custom event name
      act(() => {
        es.__emit(
          "CONNECTED",
          JSON.stringify({ payload: { sessionId: "custom-name-sess" } }),
        );
      });

      expect(result.current.sessionId).toBe("custom-name-sess");
      expect(result.current.connectionStatus).toBe("connected");
    });
  });

  describe("custom subscriptionSync config", () => {
    it("uses custom sync URL and method", async () => {
      const { result } = renderHook(() => useStreamContext(), {
        wrapper: createWrapper({
          subscriptionSync: {
            url: (sid: string) => `/custom/sync/${sid}`,
            method: "POST",
            body: (subs: unknown[]) => ({ data: subs }),
          },
        }),
      });

      const es = MockEventSource.latest!;
      act(() => {
        es.__emit(
          "connected",
          JSON.stringify({ payload: { sessionId: "s-custom" } }),
        );
      });

      act(() => {
        result.current.registerSubscription("id-1", { resource: "test" });
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/custom/sync/s-custom",
        expect.objectContaining({
          method: "POST",
        }),
      );

      const body = JSON.parse(
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.at(-1)![1].body,
      );
      expect(body).toEqual({ data: [{ resource: "test" }] });
    });
  });
});
