[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudFormSectionProps

# Interface: CrudFormSectionProps

Defined in: [packages/ui/src/crud/form/crud-form.tsx:133](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L133)

Section sub-component for CrudForm.

## Examples

```tsx
<CrudForm.Section title={<><UserIcon className="size-4" /> Account</>} variant="flat">
  ...
</CrudForm.Section>
```

```tsx
<CrudForm.Section title="Settings" trailing={<Badge variant="outline">Optional</Badge>}>
  ...
</CrudForm.Section>
```

## Extends

- `SectionShellProps`

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:63](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L63)

#### Inherited from

`SectionShellProps.children`

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:62](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L62)

#### Inherited from

`SectionShellProps.className`

***

### collapsible?

> `optional` **collapsible**: `boolean`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:59](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L59)

Enable collapsible behavior (default: false).

#### Inherited from

`SectionShellProps.collapsible`

***

### defaultOpen?

> `optional` **defaultOpen**: `boolean`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L61)

Initial open state when collapsible (default: true).

#### Inherited from

`SectionShellProps.defaultOpen`

***

### description?

> `optional` **description**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L51)

#### Inherited from

`SectionShellProps.description`

***

### layout?

> `optional` **layout**: `"single-column"` \| `"two-column"` \| `"three-column"`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:134](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L134)

***

### sectionTitle?

> `optional` **sectionTitle**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:53](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L53)

Group title rendered above the card.

#### Inherited from

`SectionShellProps.sectionTitle`

***

### title?

> `optional` **title**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L50)

#### Inherited from

`SectionShellProps.title`

***

### trailing?

> `optional` **trailing**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L57)

Content rendered on the right side of the section header.

#### Inherited from

`SectionShellProps.trailing`

***

### variant?

> `optional` **variant**: `"flat"` \| `"card"`

Defined in: [packages/ui/src/crud/shared/section-shell.tsx:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/section-shell.tsx#L55)

Visual style: `"card"` (default) renders with border and shadow, `"flat"` renders without.

#### Inherited from

`SectionShellProps.variant`
