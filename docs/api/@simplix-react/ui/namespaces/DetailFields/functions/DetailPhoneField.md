[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailPhoneField

# Function: DetailPhoneField()

> **DetailPhoneField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/phone-field.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/phone-field.tsx#L27)

Read-only phone display field: the country flag plus the stored E.164 number
formatted in its national convention (international when the country is
unknown). Pairs with the PhoneField form input.

## Parameters

### \_\_namedParameters

[`DetailPhoneFieldProps`](../interfaces/DetailPhoneFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailPhoneField label="Phone" value="+821012345678" layout="inline" />
```
