[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / startOnlineStatusSync

# Function: startOnlineStatusSync()

> **startOnlineStatusSync**(): () => `void`

Defined in: [packages/react/src/online-status-sync.ts:71](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/online-status-sync.ts#L71)

Keeps React Query's connectivity flag in sync with `navigator.onLine`.

Syncs immediately, then again every time the document becomes visible —
the moment a user returns to a tab and expects a stalled list to work. Call
it once while composing the app's providers, next to the `QueryClient` the
app creates.

Calling this again replaces the previous registration, so a module reloaded
by HMR never accumulates duplicate listeners.

## Returns

A cleanup function that stops the sync.

> (): `void`

### Returns

`void`

## Example

```ts
import { startOnlineStatusSync } from "@simplix-react/react";

const queryClient = new QueryClient();
startOnlineStatusSync();
```
