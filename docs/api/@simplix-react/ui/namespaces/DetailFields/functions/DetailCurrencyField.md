[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailCurrencyField

# Function: DetailCurrencyField()

> **DetailCurrencyField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/currency-field.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/currency-field.tsx#L27)

Read-only currency display field: the ISO 4217 code beside its localized name.

<p>The code stays visible rather than being replaced by the name — it is what the record
stores and what an operator matches against an invoice.

## Parameters

### \_\_namedParameters

[`DetailCurrencyFieldProps`](../interfaces/DetailCurrencyFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailCurrencyField label="Currency" value="KRW" layout="inline" />
```
