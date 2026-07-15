[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / StatCard

# Function: StatCard()

> **StatCard**(`props`): `Element`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L42)

Compact metric card showing a title, a primary value, and optional trend,
description, icon, and footer content. Set `highlighted` together with a
`tone` to tint the card surface for emphasis.

## Parameters

### props

[`StatCardProps`](../interfaces/StatCardProps.md)

[StatCardProps](../interfaces/StatCardProps.md)

## Returns

`Element`

## Example

```tsx
<StatCard title="Active devices" value={128} trend={{ value: 12, label: "vs last week" }} />
<StatCard title="Errors" value={3} tone="danger" highlighted />
```
