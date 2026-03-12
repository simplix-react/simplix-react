[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/stream](../README.md) / useStaleDetection

# Function: useStaleDetection()

> **useStaleDetection**(`thresholds?`): `object`

Defined in: [use-stale-detection.ts:21](https://github.com/simplix-react/simplix-react/blob/main/use-stale-detection.ts#L21)

Monitor staleness of the SSE connection based on heartbeat timing.

Default levels:
- fresh: <5s since last heartbeat
- warning: 5-10s
- critical: 10-20s
- stale: >20s

## Parameters

### thresholds?

[`StalenessThresholds`](../interfaces/StalenessThresholds.md)

## Returns

`object`

### elapsedMs

> **elapsedMs**: `number`

### level

> **level**: [`StalenessLevel`](../type-aliases/StalenessLevel.md)
