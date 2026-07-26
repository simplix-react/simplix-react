[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / resyncOnlineStatus

# Function: resyncOnlineStatus()

> **resyncOnlineStatus**(): `boolean`

Defined in: [packages/react/src/online-status-sync.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/online-status-sync.ts#L41)

Repairs React Query's cached connectivity flag from `navigator.onLine`.

When the manager's cached value already matches the browser's, this is a
no-op — `onlineManager.setOnline` notifies its subscribers only on a real
change. When the value flips back to online, the `QueryClient`'s own
`onlineManager` subscription resumes every paused fetch and refetches the
queries that opted into `refetchOnReconnect`.

Environments without `navigator.onLine` (server rendering, React Native) are
left untouched — there is no authority to repair the flag from.

## Returns

`boolean`

Whether React Query reports the browser as online after the sync.

## Example

```ts
import { resyncOnlineStatus } from "@simplix-react/react";

// After a custom connectivity probe succeeds
resyncOnlineStatus();
```
