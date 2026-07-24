[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailDateField

# Function: DetailDateField()

> **DetailDateField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/date-field.tsx:59](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/date-field.tsx#L59)

Read-only date/time display field. Supports calendar `date`, absolute `datetime`,
wall-clock `time`, and `relative` formats — one component for every temporal kind.

## Parameters

### \_\_namedParameters

[`DetailDateFieldProps`](../interfaces/DetailDateFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailDateField label="Created" value={user.createdAt} format="relative" />
<DetailDateField label="Start" value={overtime.plannedStartTime} format="time" />
```
