[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimeRangeSelectorProps

# Interface: TimeRangeSelectorProps

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:82](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L82)

Props for the [TimeRangeSelector](../functions/TimeRangeSelector.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:108](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L108)

CSS class

***

### colorStepBaseMinutes?

> `optional` **colorStepBaseMinutes**: `number`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:96](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L96)

Bucket size (in minutes) that colorSteps are calibrated for.

#### Default Value

```ts
60
```

***

### colorSteps?

> `optional` **colorSteps**: `number`[]

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:94](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L94)

Color scale step boundaries calibrated to 1-hour buckets (e.g., [1, 3, 5, 10]).
 Steps are auto-scaled proportionally when bucket size differs from 1 hour.
 0 and max are auto-added.

***

### colorTheme?

> `optional` **colorTheme**: [`HeatmapColorTheme`](../type-aliases/HeatmapColorTheme.md)

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:98](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L98)

Heatmap color theme.

#### Default Value

```ts
"slate"
```

***

### defaultWindow?

> `optional` **defaultWindow**: `string`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:102](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L102)

Initial window preset key.

#### Default Value

```ts
"1d"
```

***

### fetchCounts()

> **fetchCounts**: (`from`, `to`, `bucketCount`) => `Promise`\<`number`[]\>

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L88)

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

### maxCount?

> `optional` **maxCount**: `number`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L90)

Fixed max value for heatmap scale. Auto-calculated if omitted.

***

### maxDate?

> `optional` **maxDate**: `Date`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:106](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L106)

Latest allowed date

***

### minDate?

> `optional` **minDate**: `Date`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:104](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L104)

Earliest allowed date

***

### onChange()

> **onChange**: (`range`) => `void`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L86)

Range change callback

#### Parameters

##### range

[`TimeRangeValue`](TimeRangeValue.md)

#### Returns

`void`

***

### presets?

> `optional` **presets**: [`WindowPreset`](WindowPreset.md)[]

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:100](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L100)

Available window presets. Defaults provided if omitted.

***

### value

> **value**: `TimeRange`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L84)

Current selected range
