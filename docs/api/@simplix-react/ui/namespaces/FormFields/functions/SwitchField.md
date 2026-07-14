[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / SwitchField

# Function: SwitchField()

> **SwitchField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/switch-field.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/switch-field.tsx#L29)

Toggle switch field. Defaults to `layout="trailing"` — the switch is
right-aligned with a dashed leader line from the label, so a column of
toggles reads as a settings list; the description starts below at the
label's left edge.

## Parameters

### \_\_namedParameters

[`SwitchFieldProps`](../interfaces/SwitchFieldProps.md)

## Returns

`Element`

## Example

```tsx
<SwitchField label="Notifications" value={enabled} onChange={setEnabled} />
```
