[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailNumberField

# Function: DetailNumberField()

> **DetailNumberField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/number-field.tsx:29](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/fields/detail/number-field.tsx#L29)

Read-only number display field with Intl.NumberFormat formatting.

## Parameters

### \_\_namedParameters

[`DetailNumberFieldProps`](../interfaces/DetailNumberFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailNumberField label="Price" value={29.99} format="currency" currency="USD" />
<DetailNumberField label="Rate" value={0.85} format="percent" />
```
