[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / CrossTabSyncOptions

# Interface: CrossTabSyncOptions

Defined in: [packages/auth/src/helpers/cross-tab-sync.ts:1](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/cross-tab-sync.ts#L1)

## Properties

### onExternalLogout()

> **onExternalLogout**: () => `void`

Defined in: [packages/auth/src/helpers/cross-tab-sync.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/cross-tab-sync.ts#L5)

Called when the key is removed in another tab (external logout).

#### Returns

`void`

***

### onExternalTokenUpdate()

> **onExternalTokenUpdate**: (`data`) => `void`

Defined in: [packages/auth/src/helpers/cross-tab-sync.ts:7](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/cross-tab-sync.ts#L7)

Called when the key is updated in another tab.

#### Parameters

##### data

`string`

#### Returns

`void`

***

### storageKey

> **storageKey**: `string`

Defined in: [packages/auth/src/helpers/cross-tab-sync.ts:3](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/cross-tab-sync.ts#L3)

Storage key to observe for changes.
