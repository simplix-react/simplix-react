[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTotalBadgeProps

# Interface: ListTotalBadgeProps

Defined in: [packages/ui/src/crud/shared/list-total-badge.tsx:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/list-total-badge.tsx#L6)

## Properties

### count?

> `optional` **count**: `number` \| `null`

Defined in: [packages/ui/src/crud/shared/list-total-badge.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/list-total-badge.tsx#L13)

Total row count shown in the badge. Pass `undefined` / `null` while the
figure is unknown — the first page in flight, a count query that has not
answered — and the badge holds its place with an empty value instead of
claiming zero. A reader takes `Total 0` as "there is nothing here".
