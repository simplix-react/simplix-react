[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailListField

# Function: DetailListField()

> **DetailListField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/list-field.tsx:26](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/fields/detail/list-field.tsx#L26)

Read-only list display field. Renders string arrays as badges, comma-separated text, or a bullet list.

## Parameters

### \_\_namedParameters

[`DetailListFieldProps`](../interfaces/DetailListFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailListField label="Tags" value={["react", "typescript"]} />
<DetailListField label="Skills" value={skills} mode="comma" />
<DetailListField label="Steps" value={steps} mode="bullet" />
```
