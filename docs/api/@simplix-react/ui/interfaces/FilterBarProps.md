[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FilterBarProps

# Interface: FilterBarProps

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:143](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L143)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:174](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L174)

***

### count?

> `optional` **count**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:160](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L160)

When provided, renders a standard total-count badge at the start of the leading group.

***

### filters

> **filters**: [`FilterDef`](../type-aliases/FilterDef.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:144](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L144)

***

### leading?

> `optional` **leading**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:147](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L147)

Content rendered on the left side of the filter bar.

***

### maxBadges?

> `optional` **maxBadges**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:151](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L151)

Max number of visible filter badges before collapsing into "+N".

***

### onPreview()?

> `optional` **onPreview**: () => `void`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:156](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L156)

When provided, renders a preview button in the leading group that invokes
this handler on click. Omit to hide the button.

#### Returns

`void`

***

### popoverColumns?

> `optional` **popoverColumns**: `1` \| `2` \| `3` \| `"auto"`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:173](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L173)

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

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:158](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L158)

Label for the preview button. Defaults to the `list.preview` translation.

***

### state

> **state**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:145](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L145)

***

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:149](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L149)

Content rendered on the right side of the filter bar, before the filter/columns group.
