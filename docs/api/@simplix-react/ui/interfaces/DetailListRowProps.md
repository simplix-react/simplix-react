[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DetailListRowProps

# Interface: DetailListRowProps

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L13)

Props for the [DetailListRow](../variables/DetailListRow.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L26)

Additional classes merged onto the row root.

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L15)

Leading slot rendered before the primary content (icon or status dot).

***

### onClick()?

> `optional` **onClick**: () => `void`

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L24)

When set, the row becomes an interactive button: it gains button
semantics, keyboard activation (Enter / Space), and a hover affordance.

#### Returns

`void`

***

### primary

> **primary**: `ReactNode`

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L17)

Primary content rendered as medium-weight, truncating body text.

***

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L19)

Trailing slot rendered at the row end (badge, secondary text, flow node).
