[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / LabeledField

# Function: LabeledField()

> **LabeledField**(`props`): `Element`

Defined in: [packages/ui/src/base/controls/labeled-field.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/labeled-field.tsx#L40)

Row layout pairing a label (+ optional description) on the left with an arbitrary
trailing control on the right. Generalizes the SettingSwitch layout so any control
(Switch, Select, Button, ...) can reuse the same labelled-row presentation.

## Parameters

### props

[`LabeledFieldProps`](../interfaces/LabeledFieldProps.md)

[LabeledFieldProps](../interfaces/LabeledFieldProps.md)

## Returns

`Element`

## Example

```tsx
<LabeledField
  label="Dark Mode"
  description="Use the dark color scheme"
  htmlFor="dark-mode"
  control={<Switch id="dark-mode" checked={dark} onCheckedChange={setDark} />}
/>
```
