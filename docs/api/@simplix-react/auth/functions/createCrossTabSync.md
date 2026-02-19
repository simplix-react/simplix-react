[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / createCrossTabSync

# Function: createCrossTabSync()

> **createCrossTabSync**(`options`): `object`

Defined in: [packages/auth/src/helpers/cross-tab-sync.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/cross-tab-sync.ts#L16)

Synchronizes auth state across browser tabs via the `storage` event.

Detects when another tab logs out (key removed) or refreshes tokens
(key updated) and invokes the appropriate callback.

## Parameters

### options

[`CrossTabSyncOptions`](../interfaces/CrossTabSyncOptions.md)

## Returns

`object`

### start()

> **start**: () => `void`

#### Returns

`void`

### stop()

> **stop**: () => `void`

#### Returns

`void`
