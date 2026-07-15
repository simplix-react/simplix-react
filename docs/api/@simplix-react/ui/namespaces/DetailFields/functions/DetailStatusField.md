[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [DetailFields](../README.md) / DetailStatusField

# Function: DetailStatusField()

> **DetailStatusField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/detail/status-field.tsx:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/detail/status-field.tsx#L49)

Read-only status display field. Renders a tone-driven [StatusBadge](../../../variables/StatusBadge.md)
inside the standard detail field wrapper, with the same em-dash empty
fallback as other `DetailFields.*` components.

Unlike [DetailBadgeField](DetailBadgeField.md) (which maps values to legacy Badge variants),
this field takes a resolved [StatusTone](../../../type-aliases/StatusTone.md), so semantic status/severity
coloring stays centralized in the shared tone maps.

## Parameters

### \_\_namedParameters

[`DetailStatusFieldProps`](../interfaces/DetailStatusFieldProps.md)

## Returns

`Element`

## Example

```tsx
<DetailFields.DetailStatusField
  label={fieldLabel("status")}
  tone={cardholderStatusToTone[displayData.status] ?? "neutral"}
  value={enumLabel("CardholderStatus", displayData.status)}
  showDot
/>
```
