[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ColorDot

# Function: ColorDot()

> **ColorDot**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/display/color-dot.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/color-dot.tsx#L30)

Small circular swatch filled with an arbitrary CSS color. Use for
user-defined / data-driven colors (e.g. a holiday-type palette) where the
tone-based [StatusDot](../variables/StatusDot.md) does not apply. Centralizes the
`rounded-full` + inline `backgroundColor` span so call sites stop
re-implementing it.

## Parameters

### \_\_namedParameters

`ColorDotProps`

## Returns

`Element`

## Example

```tsx
<ColorDot color={holidayType.color} />
```
