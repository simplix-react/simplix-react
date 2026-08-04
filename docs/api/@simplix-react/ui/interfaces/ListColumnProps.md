[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListColumnProps

# Interface: ListColumnProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:255](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L255)

Declarative column definition for List.Table. Not rendered directly.

## Type Parameters

### T

`T`

## Properties

### children()?

> `optional` **children**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:305](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L305)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:282](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L282)

***

### displayZone?

> `optional` **displayZone**: `string` \| (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:291](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L291)

IANA display zone for `format="datetime"` cells. A string applies one zone to
every row (a screen pinned to one site); a function resolves the zone per row
(mixed-site lists, e.g. `(row) => zoneOf(row.siteId)`). Returning `undefined`
falls back to the browser zone. Ignored by `date` / `time` / `relative`
formats — those are zone-neutral by kind.

***

### enumLabel()?

> `optional` **enumLabel**: (`enumName`, `value`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:304](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L304)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:298](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L298)

Enum this column's values belong to, e.g. `"OrderStatus"`. Paired with
`enumLabel`, a `display="badge"` cell shows the translated label instead of
the constant the API sends.

***

### field?

> `optional` **field**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:256](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L256)

***

### format?

> `optional` **format**: `"date"` \| `"time"` \| `"datetime"` \| `"relative"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:283](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L283)

***

### header?

> `optional` **header**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:257](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L257)

***

### minWidth?

> `optional` **minWidth**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:281](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L281)

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

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:258](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L258)

***

### variants?

> `optional` **variants**: `Record`\<`string`, `"default"` \| `"success"` \| `"warning"` \| `"outline"` \| `"blue"` \| `"cyan"` \| `"fuchsia"` \| `"green"` \| `"indigo"` \| `"lime"` \| `"orange"` \| `"pink"` \| `"purple"` \| `"red"` \| `"teal"` \| `"violet"` \| `"yellow"` \| `"destructive"` \| `"secondary"` \| `"slate"` \| `"amber"` \| `"emerald"` \| `"sky"` \| `"rose"` \| `null` \| `undefined`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:292](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L292)

***

### width?

> `optional` **width**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:265](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L265)

Column content width in pixels. Also sizes the header box, so a header
longer than the width ellipsizes (full text in a tooltip) instead of
stretching the column. The cell's horizontal padding sits outside this
width, and on a sortable column the sort icon shares it with the label.
