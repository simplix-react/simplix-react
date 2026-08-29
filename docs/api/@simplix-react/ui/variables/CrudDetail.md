[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetail

# Variable: CrudDetail

> `const` **CrudDetail**: (`__namedParameters`) => `Element` & `object`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:492](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L492)

Compound component for building read-only CRUD detail views.

```
┌─────────────────────────────────────┐
│  header                       [X]   │
├─────────────────────────────────────┤
│  <CrudDetail.Section>               │
│    field rows (label: value)        │
│  </CrudDetail.Section>             │
├─────────────────────────────────────┤
│  AuditFooter (via auditData prop)  │
├─────────────────────────────────────┤
│  <CrudDetail.DefaultActions>        │
│  [← Back]        [Delete] [Edit]   │
└─────────────────────────────────────┘
```

Sub-components: Section, Actions, DefaultActions, ActionFooter, AuditFooter, List, Table.
A sub-list inside the panel is `List` when its rows are a name and a value, and `Table` when
the reader compares values down a column — anything with a header row is a `Table`.
Use `DefaultActions` for a single-row footer, `ActionFooter` for a two-tier footer
(a domain lifecycle-action row above the standard row).

## Type Declaration

### ActionFooter()

> **ActionFooter**: (`__namedParameters`) => `Element` = `DetailActionFooter`

Two-tier detail footer: a wrapping row of domain lifecycle `actions` on top, the
standard Close/Back + Delete/Edit row beneath — for detail panels whose entity has
more actions than the single DetailDefaultActions row holds. The two rows
share one divider above the whole block.

#### Parameters

##### \_\_namedParameters

[`CrudDetailActionFooterProps`](../interfaces/CrudDetailActionFooterProps.md)

#### Returns

`Element`

### Actions()

> **Actions**: (`__namedParameters`) => `Element` = `DetailActions`

#### Parameters

##### \_\_namedParameters

[`CrudDetailActionsProps`](../interfaces/CrudDetailActionsProps.md)

#### Returns

`Element`

### AuditFooter()

> **AuditFooter**: (`__namedParameters`) => `Element` \| `null` = `DetailAuditFooter`

#### Parameters

##### \_\_namedParameters

[`CrudDetailAuditFooterProps`](../interfaces/CrudDetailAuditFooterProps.md)

#### Returns

`Element` \| `null`

### DefaultActions()

> **DefaultActions**: (`props`) => `Element` = `DetailDefaultActions`

Standard single-row detail footer: Close/Back on the left, Delete / extra children /
Edit on the right. Use DetailActionFooter when the entity has domain
lifecycle actions that need their own row above this one.

#### Parameters

##### props

[`CrudDetailDefaultActionsProps`](../interfaces/CrudDetailDefaultActionsProps.md)

#### Returns

`Element`

### List()

> **List**: (`__namedParameters`) => `Element` = `DetailPagedList`

A sub-list inside a detail panel: bordered rows with the list's own pager docked under them.

<p><b>A sub-list is a real list.</b> The rows under a panel's tab — the accounts holding a role,
the grants on a scope, the people in a rank — are the same kind of thing as the rows on a list
screen, and a reader who can page through them there expects to page through them here. What
happens without this is not that the rows are missing: it is that each screen invents its own
way of saying there are more of them. Six panels in one console arrived at six — 「그 외 4명」,
a truncated ten with no note at all, a 「전체 보기」 that navigated away and lost the panel.

<p><b>It is the list's pager, not another one.</b> `CrudList.Pagination` reads its own container
width and goes compact below 640px, which is every detail panel — so the control that fills a
list screen's footer fits a 520px panel without a second component existing to be styled
differently later.

<p><b>The pager renders only when there is more than one page.</b> A single page of four rows
with a pager under it reads as a list that failed to load the rest.

#### Parameters

##### \_\_namedParameters

[`CrudDetailListProps`](../interfaces/CrudDetailListProps.md)

#### Returns

`Element`

#### Example

```tsx
<CrudDetail.List
  page={holders.page}
  pageSize={holders.pageSize}
  total={holders.total}
  totalPages={holders.totalPages}
  onPageChange={holders.setPage}
>
  {holders.rows.map((row) => (
    <DetailListRow key={row.userId} primary={row.name} trailing={row.username} />
  ))}
</CrudDetail.List>
```

### Section()

> **Section**: (`__namedParameters`) => `Element` = `DetailSection`

#### Parameters

##### \_\_namedParameters

[`CrudDetailSectionProps`](../interfaces/CrudDetailSectionProps.md)

#### Returns

`Element`

### Table()

> **Table**: (`__namedParameters`) => `Element` = `DetailPagedTable`

A sub-list inside a detail panel that needs COLUMNS, with the list's own pager docked under it.

<p><b>The other half of CrudDetail.List, and the two are chosen by one question: does the
reader compare values down a column?</b> A name and a value beside it — the accounts holding a
role, the grants on a scope — is a `List`, and its rows can be any width because nothing is read
against the row above. A change history is not: 원값 and 신값 are read as columns, and a row
whose cells sit at different x has stopped being a table. Anything with a header row is a
`Table`; a name-and-value pair is a `List`.

<p><b>Four screens were building this frame by hand.</b> A `Card` clipped to its corners, a
sideways scroll inside it, a table, and a pager underneath — assembled separately each time,
which is why one of them had the pager inside the scroll region and another had no pager at all.
The frame here is `TableCardFrame`, the same one `CrudList.TableCard` and `CrudTree.TableCard`
use, so a table in a panel and a table on a list screen are one surface rather than two that
resemble each other.

<p><b>The pager renders only when there is more than one page</b>, for the reason `List` gives:
a single page of four rows with a pager under it reads as a list that failed to load the rest.

<p><b>What it does not take is the header.</b> Column widths belong to the table — a change
history's five columns and a session list's four divide their width differently — so the caller
writes the header row and this frames it.

#### Parameters

##### \_\_namedParameters

[`CrudDetailTableProps`](../interfaces/CrudDetailTableProps.md)

#### Returns

`Element`

#### Example

```tsx
<CrudDetail.Table
  page={history.page}
  pageSize={history.pageSize}
  total={history.total}
  totalPages={history.totalPages}
  onPageChange={history.setPage}
>
  <Table>
    <TableHeader>…</TableHeader>
    <TableBody>…</TableBody>
  </Table>
</CrudDetail.Table>
```
