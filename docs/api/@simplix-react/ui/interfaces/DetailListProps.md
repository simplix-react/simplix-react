[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DetailListProps

# Interface: DetailListProps

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:93](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L93)

Props for the [DetailList](../variables/DetailList.md) container.

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:95](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L95)

[DetailListRow](../variables/DetailListRow.md) elements composing the bordered group.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:107](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L107)

Additional classes merged onto the container root.

***

### footer?

> `optional` **footer**: `ReactNode`

Defined in: [packages/ui/src/base/display/detail-list-row.tsx:105](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/detail-list-row.tsx#L105)

Docked under the last row, inside the same border and above the clip.

<p>For whatever the group owes below its rows — a pager, a total, a 「show all」 link.
Rendered only when supplied, and separated by its own top border so it reads as the group's
footer rather than as one more row. `CrudDetail.List` fills it with the list's own pager,
which is what a sub-list inside a detail panel should carry: the alternative each screen
reaches for otherwise is a caption saying 「and N more」, and six screens produce six of them.
