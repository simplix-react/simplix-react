import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  ConnectionStatus,
  MockStreamConfig,
  ParsedConnectedEvent,
  ParsedDataEvent,
  ParsedGapEvent,
  StreamContextValue,
  StreamEventNames,
  StreamProtocol,
  SubscriptionRequest,
  SubscriptionSyncConfig,
} from "./types";
import { appendStreamLog } from "./stream-log";

// ── Default protocol: simplix-stream envelope format ──

const DEFAULT_PROTOCOL: Required<StreamProtocol> = {
  parseConnected: (data) => {
    const envelope = JSON.parse(data);
    return envelope.payload as ParsedConnectedEvent;
  },
  parseData: (data) => {
    const envelope = JSON.parse(data);
    return { resource: envelope.resource, payload: envelope.payload } as ParsedDataEvent;
  },
  parseGap: (data) => {
    const payload = JSON.parse(data).payload;
    return { resource: payload.resource, reason: payload.reason } as ParsedGapEvent;
  },
};

const DEFAULT_SUBSCRIPTION_SYNC: SubscriptionSyncConfig = {
  url: (sessionId) => `/api/stream/sessions/${sessionId}/subscriptions`,
  method: "PUT",
  body: (subscriptions) => ({ subscriptions }),
};

const DEFAULT_EVENT_NAMES: Required<StreamEventNames> = {
  connected: "connected",
  reconnected: "reconnected",
  data: "data",
  heartbeat: "heartbeat",
  gap: "gap",
  error: "error",
};

const DEFAULT_HEARTBEAT_TIMEOUT_MS = 10_000;

// ── Context ──

const StreamContext = createContext<StreamContextValue | null>(null);

export function useStreamContext(): StreamContextValue {
  const ctx = useContext(StreamContext);
  if (!ctx) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return ctx;
}

// ── Provider ──

interface StreamProviderProps {
  children: ReactNode;
  /** SSE endpoint URL. Default: "/api/stream/connect" */
  url?: string;
  /** Mock mode configuration */
  mock?: MockStreamConfig;
  /** Protocol adapter for parsing SSE envelope payloads. */
  protocol?: StreamProtocol;
  /**
   * Subscription sync configuration.
   * Set to `false` to disable server-side subscription sync entirely.
   */
  subscriptionSync?: SubscriptionSyncConfig | false;
  /** Override SSE event type names if the server uses non-default names. */
  eventNames?: StreamEventNames;
  /** Heartbeat watchdog timeout in ms. Default: 10000 */
  heartbeatTimeoutMs?: number;
}

export function StreamProvider({
  children,
  url = "/api/stream/connect",
  mock,
  protocol: protocolProp,
  subscriptionSync: syncProp,
  eventNames: eventNamesProp,
  heartbeatTimeoutMs = DEFAULT_HEARTBEAT_TIMEOUT_MS,
}: StreamProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());

  const listenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatWatchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());

  // Resolve config with defaults
  const protocol: Required<StreamProtocol> = {
    ...DEFAULT_PROTOCOL,
    ...protocolProp,
  };
  const syncConfig = syncProp === false ? null : { ...DEFAULT_SUBSCRIPTION_SYNC, ...syncProp };
  const evNames: Required<StreamEventNames> = { ...DEFAULT_EVENT_NAMES, ...eventNamesProp };

  // Keep resolved config in refs to avoid stale closures
  const protocolRef = useRef(protocol);
  protocolRef.current = protocol;
  const syncConfigRef = useRef(syncConfig);
  syncConfigRef.current = syncConfig;
  const evNamesRef = useRef(evNames);
  evNamesRef.current = evNames;

  const dispatch = useCallback((resource: string, data: unknown) => {
    const callbacks = listenersRef.current.get(resource);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }, []);

  const addEventListener = useCallback(
    (resource: string, callback: (data: unknown) => void) => {
      if (!listenersRef.current.has(resource)) {
        listenersRef.current.set(resource, new Set());
      }
      listenersRef.current.get(resource)!.add(callback);

      return () => {
        const set = listenersRef.current.get(resource);
        if (set) {
          set.delete(callback);
          if (set.size === 0) {
            listenersRef.current.delete(resource);
          }
        }
      };
    },
    [],
  );

  // Subscription registry: aggregates all active subscriptions and syncs via API
  const subscriptionRegistryRef = useRef<Map<string, SubscriptionRequest>>(new Map());
  const sessionIdRef = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncSubscriptions = useCallback(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      syncTimerRef.current = null;
      const sid = sessionIdRef.current;
      const cfg = syncConfigRef.current;
      if (!sid || !cfg) return;
      // Deduplicate by resource
      const seen = new Set<string>();
      const subscriptions: SubscriptionRequest[] = [];
      for (const req of subscriptionRegistryRef.current.values()) {
        if (!seen.has(req.resource)) {
          seen.add(req.resource);
          subscriptions.push(req);
        }
      }
      const bodyBuilder = cfg.body ?? DEFAULT_SUBSCRIPTION_SYNC.body!;
      await fetch(cfg.url(sid), {
        method: cfg.method ?? "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        body: JSON.stringify(bodyBuilder(subscriptions)),
      });
    }, 0);
  }, []);

  const registerSubscription = useCallback(
    (id: string, request: SubscriptionRequest) => {
      subscriptionRegistryRef.current.set(id, request);
      syncSubscriptions();
    },
    [syncSubscriptions],
  );

  const unregisterSubscription = useCallback(
    (id: string) => {
      subscriptionRegistryRef.current.delete(id);
      syncSubscriptions();
    },
    [syncSubscriptions],
  );

  // Sync subscriptions when sessionId becomes available (or changes after reconnect)
  useEffect(() => {
    sessionIdRef.current = sessionId;
    if (sessionId && subscriptionRegistryRef.current.size > 0) {
      syncSubscriptions();
    }
  }, [sessionId, syncSubscriptions]);

  // Mock mode
  useEffect(() => {
    if (!mock?.enabled) return;

    setConnectionStatus("connected");
    setSessionId("mock-session");
    setLastHeartbeat(Date.now());

    const interval = mock.intervalMs ?? 1000;
    mockTimerRef.current = setInterval(() => {
      setLastHeartbeat(Date.now());
      if (mock.generators) {
        for (const [resource, generator] of Object.entries(mock.generators)) {
          const data = generator();
          dispatch(resource, data);
          appendStreamLog({
            timestamp: Date.now(),
            type: "mock-data",
            resource,
            summary: JSON.stringify(data),
          });
        }
      }
    }, interval);

    return () => {
      if (mockTimerRef.current) {
        clearInterval(mockTimerRef.current);
        mockTimerRef.current = null;
      }
    };
  }, [mock, dispatch]);

  // Real EventSource connection
  useEffect(() => {
    if (mock?.enabled) return;

    let heartbeatThrottleTimer: ReturnType<typeof setTimeout> | null = null;
    function touchHeartbeat() {
      const now = Date.now();
      lastHeartbeatRef.current = now;
      if (!heartbeatThrottleTimer) {
        heartbeatThrottleTimer = setTimeout(() => {
          heartbeatThrottleTimer = null;
          setLastHeartbeat(lastHeartbeatRef.current);
        }, 1000);
      }
    }

    let currentHandlers: { es: EventSource; handlers: [string, EventListener][] } | null = null;

    function cleanupEventSource() {
      if (currentHandlers) {
        const { es, handlers } = currentHandlers;
        for (const [event, handler] of handlers) {
          es.removeEventListener(event, handler);
        }
        es.onerror = null;
        es.close();
        currentHandlers = null;
      }
      eventSourceRef.current = null;
    }

    function reconnect() {
      cleanupEventSource();
      if (heartbeatThrottleTimer) {
        clearTimeout(heartbeatThrottleTimer);
        heartbeatThrottleTimer = null;
      }
      setConnectionStatus("disconnected");

      // Exponential backoff: 1s → 2s → 4s → 8s → 10s (cap)
      // ±25% jitter to avoid thundering herd on mass reconnect
      const baseDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
      const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1);
      const delay = Math.max(0, baseDelay + jitter);

      retryCountRef.current += 1;
      retryTimerRef.current = setTimeout(connect, delay);
    }

    function connect() {
      setConnectionStatus((prev) =>
        prev === "disconnected" || retryCountRef.current > 0 ? "reconnecting" : "connecting",
      );

      // EventSource does not support custom headers; pass timezone as query param
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const separator = url.includes("?") ? "&" : "?";
      const es = new EventSource(`${url}${separator}timezone=${encodeURIComponent(tz)}`);
      eventSourceRef.current = es;

      const names = evNamesRef.current;
      const proto = protocolRef.current;

      const onConnected = (e: Event) => {
        const parsed = proto.parseConnected!((e as MessageEvent).data);
        setSessionId(parsed.sessionId);
        setConnectionStatus("connected");
        touchHeartbeat();
        retryCountRef.current = 0;
        appendStreamLog({
          timestamp: Date.now(),
          type: "connected",
          summary: `sessionId=${parsed.sessionId}`,
        });
      };

      const onReconnected = (e: Event) => {
        const parsed = proto.parseConnected!((e as MessageEvent).data);
        setSessionId(parsed.sessionId);
        setConnectionStatus("connected");
        touchHeartbeat();
        retryCountRef.current = 0;
        appendStreamLog({
          timestamp: Date.now(),
          type: "reconnected",
          summary: `sessionId=${parsed.sessionId}`,
        });
      };

      const onData = (e: Event) => {
        const parsed = proto.parseData!((e as MessageEvent).data);
        touchHeartbeat();
        dispatch(parsed.resource, parsed.payload);
        appendStreamLog({
          timestamp: Date.now(),
          type: "data",
          resource: parsed.resource,
          summary: JSON.stringify(parsed.payload),
        });
      };

      const onHeartbeat = () => {
        touchHeartbeat();
        appendStreamLog({ timestamp: Date.now(), type: "heartbeat" });
      };

      const onGap = (e: Event) => {
        const parsed = proto.parseGap!((e as MessageEvent).data);
        dispatch(`__gap__${parsed.resource}`, parsed);
        appendStreamLog({
          timestamp: Date.now(),
          type: "gap",
          resource: parsed.resource,
          summary: parsed.reason,
        });
      };

      const onError = (e: Event) => {
        const me = e as MessageEvent;
        if (me.data) {
          console.error("[stream] SSE error event:", me.data);
        }
        appendStreamLog({
          timestamp: Date.now(),
          type: "error",
          summary: me.data ? String(me.data) : "Connection error",
        });
      };

      const handlers: [string, EventListener][] = [
        [names.connected!, onConnected],
        [names.reconnected!, onReconnected],
        [names.data!, onData],
        [names.heartbeat!, onHeartbeat],
        [names.gap!, onGap],
        [names.error!, onError],
      ];

      for (const [event, handler] of handlers) {
        es.addEventListener(event, handler);
      }

      currentHandlers = { es, handlers };

      es.onerror = () => {
        reconnect();
      };
    }

    connect();

    // Heartbeat watchdog: if no activity for timeout, force reconnect.
    // Vite proxy may keep the TCP connection alive after the backend dies,
    // so EventSource onerror never fires. This watchdog detects that case.
    heartbeatWatchdogRef.current = setInterval(() => {
      const elapsed = Date.now() - lastHeartbeatRef.current;
      if (elapsed > heartbeatTimeoutMs && eventSourceRef.current) {
        console.warn("[stream] Heartbeat timeout, forcing reconnect");
        reconnect();
      }
    }, 5_000);

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (heartbeatWatchdogRef.current) {
        clearInterval(heartbeatWatchdogRef.current);
        heartbeatWatchdogRef.current = null;
      }
      if (heartbeatThrottleTimer) {
        clearTimeout(heartbeatThrottleTimer);
        heartbeatThrottleTimer = null;
      }
      cleanupEventSource();
    };
  }, [url, mock, dispatch, heartbeatTimeoutMs]);

  const value: StreamContextValue = {
    sessionId,
    connectionStatus,
    lastHeartbeat,
    registerSubscription,
    unregisterSubscription,
    addEventListener,
  };

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
}
