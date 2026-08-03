[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / CurrencyField

# Function: CurrencyField()

> **CurrencyField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/currency-field.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/currency-field.tsx#L40)

Currency selector field over the ISO 4217 codes the runtime knows, with localized names.
Searchable by code, localized name, and English name.

<p>A picker rather than a text field: a currency code is three letters an operator either
knows or mistypes, and a mistyped one is stored without complaint and then formats every
amount written against it wrongly.

## Parameters

### \_\_namedParameters

[`CurrencyFieldProps`](../interfaces/CurrencyFieldProps.md)

## Returns

`Element`

## Example

```tsx
<CurrencyField
  label="Currency"
  value={code}
  onChange={(next, currency) => { setCode(next); setScale(currency?.decimalPlaces ?? 2); }}
/>
```
