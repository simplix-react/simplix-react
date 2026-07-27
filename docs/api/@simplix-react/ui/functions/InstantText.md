[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / InstantText

# Function: InstantText()

> **InstantText**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/display/date-time-text.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/date-time-text.tsx#L40)

Inline text for an absolute instant rendered in an explicit display zone — the
raw-text sibling of DetailDateField for table cells, cards, and captions
where a full field row does not fit.

## Parameters

### \_\_namedParameters

[`InstantTextProps`](../interfaces/InstantTextProps.md)

## Returns

`Element`

## Example

```tsx
<InstantText value={row.checkedInAt} displayZone={siteZone} />
<InstantText value={row.expiresAt} displayZone={siteZone} format="date" fallback="—" />
```
