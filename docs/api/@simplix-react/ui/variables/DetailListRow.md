[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DetailListRow

# Variable: DetailListRow

> `const` **DetailListRow**: `ForwardRefExoticComponent`\<[`DetailListRowProps`](../interfaces/DetailListRowProps.md) & `RefAttributes`\<`HTMLDivElement`\>\>

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L51)

A single fixed-height row inside a [DetailList](DetailList.md). Renders an optional
leading icon, a truncating primary label, and an optional trailing slot.

When `onClick` is supplied the row upgrades to button semantics with
keyboard activation and a hover background, so it stays accessible as an
actionable list item.

```
┌────────────────────────────────────────────┐
│ [icon]  Primary label (truncates)  [trailing]│
└────────────────────────────────────────────┘
```

## Example

```tsx
<DetailList>
  <DetailListRow icon={<Icon />} primary="Status" trailing={<Badge>Active</Badge>} />
  <DetailListRow primary="Region" trailing="us-east-1" onClick={openRegion} />
</DetailList>
```
