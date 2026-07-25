[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailBlockField

# Function: DetailBlockField()

> **DetailBlockField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/block-field.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/block-field.tsx#L40)

Read-only field for description or multi-line / multi-entry content, rendered
left-aligned inside a subtly shaded box below its label.

Use this instead of an inline field when the value spans multiple lines — a
reason, a note, a list of requested changes — where an inline right-aligned
layout reads as misaligned against the surrounding scalar fields.

## Parameters

### \_\_namedParameters

[`DetailBlockFieldProps`](../interfaces/DetailBlockFieldProps.md)

## Returns

`Element`

## Examples

```tsx
<DetailBlockField label="Reason" value={data.reason} />
```

```tsx
<DetailBlockField label="Requested value">
  <Stack gap="xs">
    {entries.map((e) => <Text key={e.key} size="sm">{e.label}: {e.value}</Text>)}
  </Stack>
</DetailBlockField>
```
