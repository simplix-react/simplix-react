[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListColumnProps

# Interface: ListColumnProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:261](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L261)

Declarative column definition for List.Table. Not rendered directly.

## Type Parameters

### T

`T`

## Properties

### children()?

> `optional` **children**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:343](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L343)

#### Parameters

##### props

###### row

`T`

###### value

`unknown`

#### Returns

`ReactNode`

***

### display?

> `optional` **display**: `"boolean"` \| `"badge"` \| `"phone"` \| `"country"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:320](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L320)

***

### displayZone?

> `optional` **displayZone**: `string` \| (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:329](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L329)

IANA display zone for `format="datetime"` cells. A string applies one zone to
every row (a screen pinned to one site); a function resolves the zone per row
(mixed-site lists, e.g. `(row) => zoneOf(row.siteId)`). Returning `undefined`
falls back to the browser zone. Ignored by `date` / `time` / `relative`
formats — those are zone-neutral by kind.

***

### enumLabel()?

> `optional` **enumLabel**: (`enumName`, `value`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:342](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L342)

Translates an enum constant — pass the entity translation's `enumLabel`.
Without it (or without `enumName`) the badge falls back to the raw value,
which is a constant like `IN_TRANSIT` rather than anything an operator reads.

#### Parameters

##### enumName

`string`

##### value

`string`

#### Returns

`string`

***

### enumName?

> `optional` **enumName**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:336](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L336)

Enum this column's values belong to, e.g. `"OrderStatus"`. Paired with
`enumLabel`, a `display="badge"` cell shows the translated label instead of
the constant the API sends.

***

### field?

> `optional` **field**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:262](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L262)

***

### format?

> `optional` **format**: `"date"` \| `"time"` \| `"datetime"` \| `"relative"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:321](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L321)

***

### header?

> `optional` **header**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:263](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L263)

***

### minTableWidth?

> `optional` **minTableWidth**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:319](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L319)

The narrowest table this column is worth drawing in, in pixels. Below it the column is not
rendered at all — no header, no cells, and no entry in the columns dropdown.

<p><b>The width measured is the table's own, not the window's.</b> A list screen loses most of
its width the moment a detail opens beside it, and that is exactly when a column has to go: a
table that fits at 1400px scrolls sideways at 520px, and a horizontal scrollbar under a list is
a column the reader has to go looking for. Omit the prop and the column is always drawn, which
is what every column did before this existed.

<p><b>Only put it on a column whose value the detail panel also shows.</b> A column that
disappears takes its value with it, and the reader has no way to ask for it back — there is no
「show anyway」. The arrangement only works because the thing that took the width is the panel
that carries the value: open the record and it is there. A value that lives nowhere else stays
in the table however narrow it gets.

<p><b>Not a card-mode control.</b> Below `cardBreakpoint` the table becomes cards drawn by
`cardTitle` / `cardContent`, where there are no columns to drop; this decides what the table
holds while it is still a table. The two thresholds are read against the same measurement, so
a `minTableWidth` below `cardBreakpoint` can never fire.

***

### minWidth?

> `optional` **minWidth**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:297](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L297)

The column's floor in pixels, rather than its whole allowance: it never
renders narrower than this, and it takes a share of whatever width the
table has left over. The cell stops contributing its own content to the
table's intrinsic width, so long values ellipsize instead of widening the
column, and a table with room to spare spends that room here.

Use this where the value is free text of unpredictable length — a summary,
a target, a description. Use [width](#width) instead where the column holds
something of known size and extra room would only be padding.

The cell's own content must fill the cell for the extra width to be
visible: render it as a block that truncates (`className="block truncate"`)
and give it no width of its own. Ignored when [width](#width) is also set.

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:273](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L273)

Marks the header with the required asterisk, for an editable column whose cells the user
has to fill before the row can be saved.

The cells of such a column are edited in place — usually by a `compact` field, which has no
label row of its own — so the column header is the only place the requirement can be stated.
Setting this does not validate anything: the form still decides what a missing value means,
and the cell's own `error` reports it.

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:274](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L274)

***

### variants?

> `optional` **variants**: `Record`\<`string`, `"default"` \| `"success"` \| `"warning"` \| `"outline"` \| `"blue"` \| `"cyan"` \| `"fuchsia"` \| `"green"` \| `"indigo"` \| `"lime"` \| `"orange"` \| `"pink"` \| `"purple"` \| `"red"` \| `"teal"` \| `"violet"` \| `"yellow"` \| `"destructive"` \| `"secondary"` \| `"slate"` \| `"amber"` \| `"emerald"` \| `"sky"` \| `"rose"` \| `null` \| `undefined`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:330](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L330)

***

### width?

> `optional` **width**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:281](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L281)

Column content width in pixels. Also sizes the header box, so a header
longer than the width ellipsizes (full text in a tooltip) instead of
stretching the column. The cell's horizontal padding sits outside this
width, and on a sortable column the sort icon shares it with the label.
