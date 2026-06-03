[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / TextField

# Function: TextField()

> **TextField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/text-field.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/text-field.tsx#L51)

Text input field with label, error, and description support.

Supports leading/trailing adornments via [TextFieldProps.prefixControl](../interfaces/TextFieldProps.md#prefixcontrol) /
[TextFieldProps.suffixControl](../interfaces/TextFieldProps.md#suffixcontrol). Convenience props [TextFieldProps.iconValue](../interfaces/TextFieldProps.md#iconvalue) /
[TextFieldProps.colorValue](../interfaces/TextFieldProps.md#colorvalue) auto-render the standard pickers.

## Parameters

### \_\_namedParameters

[`TextFieldProps`](../interfaces/TextFieldProps.md)

## Returns

`Element`

## Example

```tsx
<TextField label="Name" value={v} onChange={setV} iconValue={icon} onIconChange={setIcon} />
```
