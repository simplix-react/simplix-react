[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimeRangeSelector

# Function: TimeRangeSelector()

> **TimeRangeSelector**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/inputs/time-range-selector.tsx:193](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector.tsx#L193)

Time range selector with heatmap visualization.

<p>Displays a single-row heatmap showing count distribution over a time window.
Users can select sub-ranges via drag, switch window sizes via presets, navigate
with ◀ ▶ buttons, or pick dates directly via calendar.

## Parameters

### \_\_namedParameters

[`TimeRangeSelectorProps`](../interfaces/TimeRangeSelectorProps.md)

## Returns

`Element`

## Example

```tsx
<TimeRangeSelector
  value={{ from: startOfDay, to: endOfDay }}
  onChange={setTimeRange}
  fetchCounts={async (from, to, buckets) => api.getCounts(from, to, buckets)}
/>
```
