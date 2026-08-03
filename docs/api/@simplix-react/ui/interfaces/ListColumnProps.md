[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListColumnProps

# Interface: ListColumnProps\<T\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:248](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L248)

Declarative column definition for List.Table. Not rendered directly.

## Type Parameters

### T

`T`

## Properties

### children()?

> `optional` **children**: (`props`) => `ReactNode`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:298](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L298)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:275](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L275)

***

### displayZone?

> `optional` **displayZone**: `string` \| (`row`) => `string` \| `undefined`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:284](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L284)

IANA display zone for `format="datetime"` cells. A string applies one zone to
every row (a screen pinned to one site); a function resolves the zone per row
(mixed-site lists, e.g. `(row) => zoneOf(row.siteId)`). Returning `undefined`
falls back to the browser zone. Ignored by `date` / `time` / `relative`
formats — those are zone-neutral by kind.

***

### enumLabel()?

> `optional` **enumLabel**: (`enumName`, `value`) => `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:297](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L297)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:291](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L291)

Enum this column's values belong to, e.g. `"OrderStatus"`. Paired with
`enumLabel`, a `display="badge"` cell shows the translated label instead of
the constant the API sends.

***

### field?

> `optional` **field**: keyof `T` & `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:249](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L249)

***

### format?

> `optional` **format**: `"date"` \| `"time"` \| `"datetime"` \| `"relative"`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:276](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L276)

***

### header?

> `optional` **header**: `string`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:250](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L250)

***

### minWidth?

> `optional` **minWidth**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:274](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L274)

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

Defined in: [packages/ui/src/crud/list/crud-list.tsx:251](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L251)

***

### variants?

> `optional` **variants**: `Record`\<`string`, `"default"` \| `"success"` \| `"warning"` \| `"outline"` \| `"blue"` \| `"cyan"` \| `"fuchsia"` \| `"green"` \| `"indigo"` \| `"lime"` \| `"orange"` \| `"pink"` \| `"purple"` \| `"red"` \| `"teal"` \| `"violet"` \| `"yellow"` \| `"destructive"` \| `"secondary"` \| `"slate"` \| `"amber"` \| `"emerald"` \| `"sky"` \| `"rose"` \| `null` \| `undefined`\>

Defined in: [packages/ui/src/crud/list/crud-list.tsx:285](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L285)

***

### width?

> `optional` **width**: `number`

Defined in: [packages/ui/src/crud/list/crud-list.tsx:258](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/crud-list.tsx#L258)

Column content width in pixels. Also sizes the header box, so a header
longer than the width ellipsizes (full text in a tooltip) instead of
stretching the column. The cell's horizontal padding sits outside this
width, and on a sortable column the sort icon shares it with the label.
