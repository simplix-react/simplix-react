[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FilterBarProps

# Interface: FilterBarProps

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:157](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L157)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:195](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L195)

***

### count?

> `optional` **count**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:174](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L174)

When provided, renders a standard total-count badge at the start of the leading group.

***

### countLoading?

> `optional` **countLoading**: `boolean`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:181](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L181)

Overrides where the badge takes its "count not known yet" state from.
Defaults to the list state's own `isLoading`, so a `useCrudList` list needs
nothing here; pass it on a standalone FilterBar whose count comes from a
query the filter state knows nothing about.

***

### filters

> **filters**: [`FilterDef`](../type-aliases/FilterDef.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:158](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L158)

***

### leading?

> `optional` **leading**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:161](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L161)

Content rendered on the left side of the filter bar.

***

### maxBadges?

> `optional` **maxBadges**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:165](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L165)

Max number of visible filter badges before collapsing into "+N".

***

### onPreview()?

> `optional` **onPreview**: () => `void`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:170](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L170)

When provided, renders a preview button in the leading group that invokes
this handler on click. Omit to hide the button.

#### Returns

`void`

***

### popoverColumns?

> `optional` **popoverColumns**: `1` \| `2` \| `3` \| `"auto"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:194](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L194)

Column layout of the filter popover form.

- `"auto"` (default) — one column; switches to two columns when the form
  overflows its max height (a vertical scrollbar would appear).
- `1` — always a single 320px column.
- `2` — always two columns in a 560px popover.
- `3` — always three columns in an 800px popover.

Column boundaries follow `columnBreak` flags on the filter definitions;
without flags the filters are split evenly.

***

### previewLabel?

> `optional` **previewLabel**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:172](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L172)

Label for the preview button. Defaults to the `list.preview` translation.

***

### state

> **state**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:159](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L159)

***

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:163](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L163)

Content rendered on the right side of the filter bar, before the filter/columns group.
