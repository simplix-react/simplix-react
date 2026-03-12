[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/stream](../README.md) / useTimestampFreshness

# Function: useTimestampFreshness()

> **useTimestampFreshness**\<`L`\>(`timestamp`, `thresholds`, `defaultLevel`): `object`

Defined in: [use-timestamp-freshness.ts:20](https://github.com/simplix-react/simplix-react/blob/main/use-timestamp-freshness.ts#L20)

Track elapsed time from a timestamp and resolve it to a named level.

Polls every 1 second. Levels are evaluated in order — the last matching
threshold wins (i.e., thresholds should be sorted ascending by seconds).

## Type Parameters

### L

`L` *extends* `string`

## Parameters

### timestamp

`number`

The reference timestamp (e.g., Date.now() of last update).
                   Pass 0 to always return `defaultLevel` with elapsed 0.

### thresholds

readonly [`FreshnessThreshold`](../interfaces/FreshnessThreshold.md)\<`L`\>[]

Ascending list of { seconds, level } entries.

### defaultLevel

`L`

Level returned when elapsed is below all thresholds.

## Returns

`object`

### elapsedMs

> **elapsedMs**: `number`

### level

> **level**: `L`
