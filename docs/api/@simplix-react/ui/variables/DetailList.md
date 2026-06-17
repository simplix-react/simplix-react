[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DetailList

# Variable: DetailList

> `const` **DetailList**: `ForwardRefExoticComponent`\<[`DetailListProps`](../interfaces/DetailListProps.md) & `RefAttributes`\<`HTMLDivElement`\>\>

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:113](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L113)

Bordered, rounded container that groups [DetailListRow](DetailListRow.md) items. The
`overflow-hidden` clip lets each row's bottom border (and the
`last:border-b-0` on the final row) render as a clean, seamless divider set.

## Example

```tsx
<DetailList>
  <DetailListRow primary="Name" trailing="acme-prod" />
  <DetailListRow primary="Owner" trailing="ops-team" />
</DetailList>
```
