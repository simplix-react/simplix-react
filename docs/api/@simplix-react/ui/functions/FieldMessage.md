[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FieldMessage

# Function: FieldMessage()

> **FieldMessage**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/shared/field-message.tsx:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-message.tsx#L33)

Inline message for form fields supporting error, warning, info, and description variants.

## Parameters

### \_\_namedParameters

[`FieldMessageProps`](../interfaces/FieldMessageProps.md)

## Returns

`Element`

## Example

```tsx
<FieldMessage variant="error">This field is required</FieldMessage>
<FieldMessage variant="warning">SCP Number already in use</FieldMessage>
<FieldMessage variant="info">Range: 1–1024</FieldMessage>
```
