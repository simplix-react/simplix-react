[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / AutoRefreshSchedulerOptions

# Interface: AutoRefreshSchedulerOptions

Defined in: [packages/auth/src/helpers/auto-refresh-scheduler.ts:3](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/auto-refresh-scheduler.ts#L3)

## Properties

### minIntervalSeconds?

> `optional` **minIntervalSeconds**: `number`

Defined in: [packages/auth/src/helpers/auto-refresh-scheduler.ts:7](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/auto-refresh-scheduler.ts#L7)

Minimum interval between refreshes in seconds. Defaults to `30`.

***

### onRefreshFailed()?

> `optional` **onRefreshFailed**: () => `void`

Defined in: [packages/auth/src/helpers/auto-refresh-scheduler.ts:9](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/auto-refresh-scheduler.ts#L9)

Called when a scheduled refresh fails.

#### Returns

`void`

***

### refreshBeforeExpirySeconds?

> `optional` **refreshBeforeExpirySeconds**: `number`

Defined in: [packages/auth/src/helpers/auto-refresh-scheduler.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/auto-refresh-scheduler.ts#L5)

Seconds before expiry to trigger refresh. Defaults to `60`.
