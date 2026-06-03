# @simplix-react-ext/simplix-boot-stream

SimpliX Boot SSE streaming infrastructure with EventSource management, subscriptions, and staleness detection. Wrap your app in a `StreamProvider`, then consume live resource updates via React hooks.

## Installation

```bash
pnpm add @simplix-react-ext/simplix-boot-stream
```

> **Prerequisites:** Requires `react` (>=18) as a peer dependency. By default the provider connects to a SimpliX Boot (Spring Boot) SSE backend and parses the SimpliX-stream envelope format — that is why this package lives in the `simplix-boot` extension rather than core. To target a different backend, override the `protocol`, `url`, and `subscriptionSync` props on `StreamProvider`.

## Usage

### Wrap Your App

Mount `StreamProvider` near the root of your app. It opens a single `EventSource` connection, manages reconnection with exponential backoff, and exposes the connection to descendant hooks via context.

```tsx
import { StreamProvider } from "@simplix-react-ext/simplix-boot-stream";

function App() {
  return (
    <StreamProvider url="/api/stream/connect">
      <Dashboard />
    </StreamProvider>
  );
}
```

Gate the connection on auth readiness with the `disabled` prop — keep it `true` while auth is rehydrating, then flip to `false` once authentication is verified so the `EventSource` never fires with a stale session cookie.

```tsx
<StreamProvider url="/api/stream/connect" disabled={!isAuthReady}>
  <Dashboard />
</StreamProvider>
```

### Consume the Connection

Use `useStreamContext` to read the live connection state:

```tsx
import { useStreamContext } from "@simplix-react-ext/simplix-boot-stream";

function ConnectionBadge() {
  const { connectionStatus, sessionId } = useStreamContext();
  return <span>{connectionStatus} ({sessionId ?? "no session"})</span>;
}
```

### Subscribe to a Resource

`useStreamSubscription` registers a server-side subscription on mount, unregisters on unmount, and returns the latest payload received for that resource:

```tsx
import { useStreamSubscription } from "@simplix-react-ext/simplix-boot-stream";

interface HealthPayload {
  status: "UP" | "DOWN";
}

function HealthWidget() {
  const health = useStreamSubscription<HealthPayload>("middleware-health");
  return <span>{health?.status ?? "..."}</span>;
}
```

For push (broadcast) resources that do not require explicit server-side registration, pass `subscribe: false`:

```tsx
const events = useStreamSubscription("audit-events", { subscribe: false });
```

### Detect Staleness and Freshness

`useStaleDetection` derives a staleness level from the time since the last heartbeat:

```tsx
import { useStaleDetection } from "@simplix-react-ext/simplix-boot-stream";

function StalenessIndicator() {
  const { level, elapsedMs } = useStaleDetection();
  // level: "fresh" | "warning" | "critical" | "stale"
  return <span>{level} ({Math.round(elapsedMs / 1000)}s)</span>;
}
```

`useTimestampFreshness` is the lower-level primitive for tracking elapsed time from any timestamp against custom thresholds:

```tsx
import {
  useTimestampFreshness,
  type FreshnessThreshold,
} from "@simplix-react-ext/simplix-boot-stream";

const thresholds: FreshnessThreshold<"recent" | "old">[] = [
  { seconds: 30, level: "recent" },
  { seconds: 300, level: "old" },
];

function RowAge({ updatedAt }: { updatedAt: number }) {
  const { level } = useTimestampFreshness(updatedAt, thresholds, "live");
  return <span data-level={level} />;
}
```

### Inspect Stream Logs

Logging is off by default. Toggle it at runtime and render the captured entries — useful for a developer/debug panel:

```tsx
import {
  useStreamLogs,
  setStreamLogEnabled,
  clearStreamLogs,
} from "@simplix-react-ext/simplix-boot-stream";

function StreamLogPanel() {
  const logs = useStreamLogs();
  return (
    <div>
      <button onClick={() => setStreamLogEnabled(true)}>Enable</button>
      <button onClick={() => setStreamLogEnabled(false)}>Disable</button>
      <button onClick={clearStreamLogs}>Clear</button>
      <ul>
        {logs.map((entry) => (
          <li key={entry.id}>
            {entry.type} {entry.resource} {entry.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

> **Note:** Calling `setStreamLogEnabled(false)` also clears the existing log buffer. The buffer is capped at the most recent 200 entries.

## API Reference

### `StreamProvider`

Provides the SSE connection to descendant hooks. Opens a single `EventSource`, dispatches resource events to subscribers, syncs subscriptions to the server, and manages reconnection with exponential backoff (1s → 2s → 4s → 8s → 10s cap, with +/-25% jitter).

**Props:**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | App subtree that consumes the stream |
| `url` | `string` | `"/api/stream/connect"` | SSE endpoint URL |
| `mock` | `MockStreamConfig` | - | Mock mode configuration; when enabled, skips the real connection and emits generated data |
| `protocol` | `StreamProtocol` | SimpliX-stream envelope parser | Adapter for parsing SSE event payloads; merged over the defaults per function |
| `subscriptionSync` | `SubscriptionSyncConfig \| false` | SimpliX Boot sync (`PUT /api/stream/sessions/:id/subscriptions`) | How to sync active subscriptions to the server; set to `false` to disable server-side sync entirely |
| `eventNames` | `StreamEventNames` | `connected` / `reconnected` / `data` / `heartbeat` / `gap` / `error` | Override SSE event type names if the server uses non-default names |
| `heartbeatTimeoutMs` | `number` | `10000` | Heartbeat watchdog timeout; if no activity arrives within this window, the provider forces a reconnect |
| `disabled` | `boolean` | `false` | When `true`, mounts the context but skips the SSE connection (gate on auth readiness) |
| `maxConsecutiveRetries` | `number` | `20` | Cap on consecutive failed reconnect attempts before the provider gives up and stops the watchdog (~3 minutes with the built-in backoff); a reload or remount is required to retry |

### `useStreamContext()`

Returns the current `StreamContextValue` from the nearest `StreamProvider`. Throws if called outside a provider.

**Returns (`StreamContextValue`):**

| Field | Type | Description |
| --- | --- | --- |
| `sessionId` | `string \| null` | Server-assigned session ID, set after the connected event |
| `connectionStatus` | `ConnectionStatus` | Current connection state |
| `lastHeartbeat` | `number` | Timestamp (ms) of the last heartbeat or activity |
| `registerSubscription` | `(id: string, request: SubscriptionRequest) => void` | Register a subscription in the global registry |
| `unregisterSubscription` | `(id: string) => void` | Remove a subscription from the registry |
| `addEventListener` | `(resource: string, callback: (data: unknown) => void) => () => void` | Listen for a resource's data; returns an unsubscribe function |

### `useStreamSubscription(resource, options?)`

Subscribes to a SSE resource and returns the latest payload received. Registers a server-side subscription on mount (unless `subscribe` is `false`) and unregisters on unmount.

**Parameters:**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `resource` | `string` | - | Resource name to listen for (e.g., `"middleware-health"`) |
| `options.params` | `Record<string, string>` | - | Optional parameters sent with the subscription |
| `options.subscribe` | `boolean` | `true` | Whether to register a server-side subscription; set to `false` for broadcast push resources |

**Returns:** `T | null` — the latest received payload, or `null` until the first event arrives.

### `useStaleDetection(thresholds?)`

Monitors staleness of the SSE connection based on time since the last heartbeat.

**Parameters:**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `thresholds.warningSeconds` | `number` | `5` | Seconds until `"warning"` level |
| `thresholds.criticalSeconds` | `number` | `10` | Seconds until `"critical"` level |
| `thresholds.staleSeconds` | `number` | `20` | Seconds until `"stale"` level |

**Returns:** `{ level: StalenessLevel; elapsedMs: number }`. Below `warningSeconds`, `level` is `"fresh"`.

### `useTimestampFreshness(timestamp, thresholds, defaultLevel)`

Lower-level primitive that tracks elapsed time from a timestamp and resolves it to a named level. Polls every second; the last matching threshold wins (thresholds must be sorted ascending by `seconds`).

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `timestamp` | `number` | Reference timestamp (ms); pass `0` to always return `defaultLevel` with `elapsedMs` of `0` |
| `thresholds` | `readonly FreshnessThreshold<L>[]` | Ascending list of `{ seconds, level }` entries |
| `defaultLevel` | `L` | Level returned when elapsed is below all thresholds |

**Returns:** `{ level: L; elapsedMs: number }`.

### Stream Log Functions

| Function | Signature | Description |
| --- | --- | --- |
| `useStreamLogs` | `() => readonly StreamLogEntry[]` | Subscribe to the in-memory log buffer (capped at 200 entries) |
| `setStreamLogEnabled` | `(value: boolean) => void` | Enable or disable logging; disabling also clears the buffer |
| `clearStreamLogs` | `() => void` | Clear all captured log entries |

## Types

### `ConnectionStatus`

```ts
type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";
```

### `StalenessLevel`

```ts
type StalenessLevel = "fresh" | "warning" | "critical" | "stale";
```

### `SSEEventType`

```ts
type SSEEventType = "CONNECTED" | "DATA" | "HEARTBEAT" | "ERROR" | "RECONNECTED" | "GAP";
```

### `StreamProtocol`

Adapter that decouples the provider from a specific SSE envelope format. Each function receives the raw `MessageEvent.data` string. Omitted functions fall back to the default SimpliX-stream parser.

```ts
interface StreamProtocol {
  parseConnected?: (data: string) => ParsedConnectedEvent;
  parseData?: (data: string) => ParsedDataEvent;
  parseGap?: (data: string) => ParsedGapEvent;
}

interface ParsedConnectedEvent {
  sessionId: string;
}

interface ParsedDataEvent {
  resource: string;
  payload: unknown;
}

interface ParsedGapEvent {
  resource: string;
  reason: string;
}
```

### `SubscriptionSyncConfig`

Tells the provider how to sync active subscriptions to the server. Set the `subscriptionSync` prop to `false` to disable sync entirely.

```ts
interface SubscriptionSyncConfig {
  /** Build the URL for subscription sync. Receives the session ID. */
  url: (sessionId: string) => string;
  /** HTTP method. Default: "PUT" */
  method?: string;
  /** Build the request body. Default: `{ subscriptions }` */
  body?: (subscriptions: SubscriptionRequest[]) => unknown;
}
```

### `MockStreamConfig`

Drives mock mode. When `enabled`, the provider skips the real connection, reports `"connected"`, and emits generated data on an interval.

```ts
interface MockStreamConfig {
  enabled: boolean;
  generators?: Record<string, () => unknown>;
  intervalMs?: number;
}
```

### `StreamEventNames`

```ts
interface StreamEventNames {
  connected?: string;
  reconnected?: string;
  data?: string;
  heartbeat?: string;
  gap?: string;
  error?: string;
}
```

### `StreamLogEntry`

```ts
interface StreamLogEntry {
  id: number;
  timestamp: number;
  type: "connected" | "reconnected" | "data" | "heartbeat" | "gap" | "error" | "mock-data";
  resource?: string;
  summary?: string;
}
```

### `FreshnessThreshold`

```ts
interface FreshnessThreshold<L extends string> {
  readonly seconds: number;
  readonly level: L;
}
```

### Server Wire Types

These types describe the raw server payloads and subscription requests. `SubscriptionRequest`, `StreamContextValue`, and `StalenessThresholds` are also exported and appear inline in the API reference above.

```ts
interface SSEDataPayload<T = unknown> {
  resource: string;
  params: Record<string, string>;
  data: T;
}

interface SSEConnectedPayload {
  sessionId: string;
}

interface SSEGapPayload {
  resource: string;
  reason: string;
}

interface SubscriptionRequest {
  resource: string;
  params?: Record<string, string>;
}
```

## Related

- [SimpliX Boot extension](../../README.md)
</content>
</invoke>
