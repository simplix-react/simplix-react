[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailTextareaField

# Function: DetailTextareaField()

> **DetailTextareaField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/textarea-field.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/textarea-field.tsx#L24)

Read-only multi-line text display field. Preserves line breaks via
`whitespace-pre-wrap`. Counterpart to [DetailI18nTextareaField](DetailI18nTextareaField.md) for
non-i18n plain string values.

## Parameters

### \_\_namedParameters

[`DetailTextareaFieldProps`](../interfaces/DetailTextareaFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailTextareaField label="Description" value={data.description} />
```
