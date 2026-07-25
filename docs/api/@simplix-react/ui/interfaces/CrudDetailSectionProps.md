[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailSectionProps

# Interface: CrudDetailSectionProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:206](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L206)

Shared props for section components (CrudDetail.Section, CrudForm.Section).

## Extends

- [`SectionShellProps`](SectionShellProps.md)

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L78)

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`children`](SectionShellProps.md#children)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L77)

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`className`](SectionShellProps.md#classname)

***

### collapsible?

> `optional` **collapsible**: `boolean`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L74)

Enable collapsible behavior (default: false).

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`collapsible`](SectionShellProps.md#collapsible)

***

### defaultOpen?

> `optional` **defaultOpen**: `boolean`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L76)

Initial open state when collapsible (default: true).

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`defaultOpen`](SectionShellProps.md#defaultopen)

***

### description?

> `optional` **description**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:66](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L66)

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`description`](SectionShellProps.md#description)

***

### layout?

> `optional` **layout**: `"single-column"` \| `"two-column"` \| `"three-column"`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:214](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L214)

Field arrangement inside the section body. `"single-column"` (default)
stacks rows; `"two-column"` / `"three-column"` lay fields out in a grid
with a wide column gutter and the same tight row rhythm as the stack.
Use this instead of a hand-rolled `<Grid>` so row spacing and left inset
stay framework-governed across every detail screen.

***

### sectionTitle?

> `optional` **sectionTitle**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:68](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L68)

Group title rendered above the card.

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`sectionTitle`](SectionShellProps.md#sectiontitle)

***

### title?

> `optional` **title**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:65](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L65)

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`title`](SectionShellProps.md#title)

***

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L72)

Content rendered on the right side of the section header.

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`trailing`](SectionShellProps.md#trailing)

***

### variant?

> `optional` **variant**: `"flat"` \| `"card"` \| `"lined"`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:70](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L70)

Visual style: `"card"` (default) renders with border and shadow, `"flat"` renders without, `"lined"` adds a left border on the body.

#### Inherited from

[`SectionShellProps`](SectionShellProps.md).[`variant`](SectionShellProps.md#variant)
