[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimeRangeSelectorProps

# Interface: TimeRangeSelectorProps

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L30)

Props for the [TimeRangeSelector](../functions/TimeRangeSelector.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L58)

CSS class

***

### colorStepBaseMinutes?

> `optional` **colorStepBaseMinutes**: `number`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L44)

Bucket size (in minutes) that colorSteps are calibrated for.

#### Default Value

```ts
60
```

***

### colorSteps?

> `optional` **colorSteps**: `number`[]

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L42)

Color scale step boundaries calibrated to 1-hour buckets (e.g., [1, 3, 5, 10]).
 Steps are auto-scaled proportionally when bucket size differs from 1 hour.
 0 and max are auto-added.

***

### colorTheme?

> `optional` **colorTheme**: [`HeatmapColorTheme`](../type-aliases/HeatmapColorTheme.md)

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L46)

Heatmap color theme.

#### Default Value

```ts
"slate"
```

***

### defaultWindow?

> `optional` **defaultWindow**: `string`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L50)

Initial window preset key.

#### Default Value

```ts
"1d"
```

***

### fetchCounts()

> **fetchCounts**: (`from`, `to`, `bucketCount`) => `Promise`\<`number`[]\>

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L36)

Fetch counts for the visible window. Called when view range changes.

#### Parameters

##### from

`Date`

##### to

`Date`

##### bucketCount

`number`

#### Returns

`Promise`\<`number`[]\>

***

### hour12?

> `optional` **hour12**: `boolean`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L56)

Use 12-hour time formatting (AM/PM).

#### Default Value

```ts
false — compact 24-hour, suited to the dense label row.
```

***

### maxCount?

> `optional` **maxCount**: `number`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L38)

Fixed max value for heatmap scale. Auto-calculated if omitted.

***

### maxDate?

> `optional` **maxDate**: `Date`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L54)

Latest allowed date

***

### minDate?

> `optional` **minDate**: `Date`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L52)

Earliest allowed date

***

### onChange()

> **onChange**: (`range`) => `void`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L34)

Range change callback

#### Parameters

##### range

[`TimeRangeValue`](TimeRangeValue.md)

#### Returns

`void`

***

### presets?

> `optional` **presets**: [`WindowPreset`](WindowPreset.md)[]

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L48)

Available window presets. Defaults provided if omitted.

***

### value

> **value**: `TimeRange`

Defined in: [packages/ui/src/base/inputs/time-range-selector/types.ts:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/types.ts#L32)

Current selected range
