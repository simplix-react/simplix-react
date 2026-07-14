[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TimeRangeSelector

# Function: TimeRangeSelector()

> **TimeRangeSelector**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/inputs/time-range-selector/index.tsx:81](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/time-range-selector/index.tsx#L81)

Time range selector with heatmap visualization.

<p>Displays a single-row heatmap showing count distribution over a time window.
Select a sub-range by dragging (mouse, touch, or pen) or with the keyboard
(arrow keys move, Shift+arrows resize, Home/End jump, PageUp/Down navigate),
switch window sizes via presets, navigate with ◀ ▶, jump to Now, or pick dates
via the calendar. Expanding a selection zooms the view into it (a preset-less
"custom" window); the Custom chip zooms back out.

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
