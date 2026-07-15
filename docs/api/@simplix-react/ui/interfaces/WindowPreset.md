[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / WindowPreset

# Interface: WindowPreset

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L6)

A window preset defines a viewing window size and its bucket granularity.

## Properties

### bucketMinutes

> **bucketMinutes**: `number`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L14)

Bucket size in minutes (sub-minute values use fractions, e.g., 10s = 10/60)

***

### key

> **key**: `string`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L8)

Unique key (e.g., "1h", "1d"). The reserved key "custom" denotes a preset-less window.

***

### label

> **label**: `string`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L10)

Display label

***

### windowMinutes

> **windowMinutes**: `number`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L12)

Window size in minutes
