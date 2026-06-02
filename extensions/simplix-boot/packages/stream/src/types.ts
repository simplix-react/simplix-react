// SSE event types from the server
export type SSEEventType = "CONNECTED" | "DATA" | "HEARTBEAT" | "ERROR" | "RECONNECTED" | "GAP";

// Client connection status
export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

// Staleness level based on heartbeat timeout
export type StalenessLevel = "fresh" | "warning" | "critical" | "stale";

// Payload received on DATA events
export interface SSEDataPayload<T = unknown> {
  resource: string;
  params: Record<string, string>;
  data: T;
}

// CONNECTED event payload from server
export interface SSEConnectedPayload {
  sessionId: string;
}

// GAP event payload
export interface SSEGapPayload {
  resource: string;
  reason: string;
}

// Subscription request to register with the server
export interface SubscriptionRequest {
  resource: string;
  params?: Record<string, string>;
}

// Context value exposed by StreamProvider
export interface StreamContextValue {
  sessionId: string | null;
  connectionStatus: ConnectionStatus;
  lastHeartbeat: number;
  registerSubscription: (id: string, request: SubscriptionRequest) => void;
  unregisterSubscription: (id: string) => void;
  addEventListener: (resource: string, callback: (data: unknown) => void) => () => void;
}

// Mock mode configuration
export interface MockStreamConfig {
  enabled: boolean;
  generators?: Record<string, () => unknown>;
  intervalMs?: number;
}

// ── Protocol abstraction ──

/** Parsed result from a "connected" / "reconnected" SSE event */
export interface ParsedConnectedEvent {
  sessionId: string;
}

/** Parsed result from a "data" SSE event */
export interface ParsedDataEvent {
  resource: string;
  payload: unknown;
}

/** Parsed result from a "gap" SSE event */
export interface ParsedGapEvent {
  resource: string;
  reason: string;
}

/**
 * Protocol adapter that decouples the framework from a specific SSE envelope format.
 * All functions receive the raw MessageEvent.data string.
 * If omitted, the default simplix-stream envelope format is used.
 */
export interface StreamProtocol {
  parseConnected?: (data: string) => ParsedConnectedEvent;
  parseData?: (data: string) => ParsedDataEvent;
  parseGap?: (data: string) => ParsedGapEvent;
}

/**
 * Subscription sync configuration.
 * Tells the provider how to sync active subscriptions to the server.
 * Set to `false` on StreamProvider to disable sync entirely.
 */
export interface SubscriptionSyncConfig {
  /** Build the URL for subscription sync. Receives the session ID. */
  url: (sessionId: string) => string;
  /** HTTP method. Default: "PUT" */
  method?: string;
  /** Build the request body. Default: `{ subscriptions }` */
  body?: (subscriptions: SubscriptionRequest[]) => unknown;
}

/** Staleness threshold configuration (in seconds) */
export interface StalenessThresholds {
  /** Seconds until "warning" level. Default: 5 */
  warningSeconds?: number;
  /** Seconds until "critical" level. Default: 10 */
  criticalSeconds?: number;
  /** Seconds until "stale" level. Default: 20 */
  staleSeconds?: number;
}

/** SSE event name mapping. Override individual names if the server uses non-default event types. */
export interface StreamEventNames {
  connected?: string;
  reconnected?: string;
  data?: string;
  heartbeat?: string;
  gap?: string;
  error?: string;
}
