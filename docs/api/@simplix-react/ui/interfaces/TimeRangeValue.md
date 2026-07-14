[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimeRangeValue

# Interface: TimeRangeValue

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L24)

Date range with bucket information, emitted via onChange.

## Extends

- `TimeRange`

## Properties

### bucketMinutes

> **bucketMinutes**: `number`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L26)

Current bucket granularity in minutes. Useful for server-side aggregation.

***

### from

> **from**: `Date`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L19)

#### Inherited from

`TimeRange.from`

***

### to

> **to**: `Date`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L20)

#### Inherited from

`TimeRange.to`
