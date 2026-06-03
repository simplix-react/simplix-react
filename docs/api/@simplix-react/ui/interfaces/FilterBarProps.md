[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FilterBarProps

# Interface: FilterBarProps

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L74)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L88)

***

### filters

> **filters**: [`FilterDef`](../type-aliases/FilterDef.md)[]

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L75)

***

### leading?

> `optional` **leading**: `ReactNode`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L78)

Content rendered on the left side of the filter bar.

***

### maxBadges?

> `optional` **maxBadges**: `number`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:80](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L80)

Max number of visible filter badges before collapsing into "+N".

***

### onPreview()?

> `optional` **onPreview**: () => `void`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:85](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L85)

When provided, renders a preview button in the leading group that invokes
this handler on click. Omit to hide the button.

#### Returns

`void`

***

### previewLabel?

> `optional` **previewLabel**: `string`

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:87](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L87)

Label for the preview button. Defaults to the `list.preview` translation.

***

### state

> **state**: [`CrudListFilters`](CrudListFilters.md)

Defined in: [packages/ui/src/crud/filters/filter-bar.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/filter-bar.tsx#L76)
