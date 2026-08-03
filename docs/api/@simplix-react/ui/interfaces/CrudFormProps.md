[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudFormProps

# Interface: CrudFormProps

Defined in: [packages/ui/src/crud/form/crud-form.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L41)

Props for the [CrudForm](../variables/CrudForm.md) compound component root.

```
┌─────────────────────────────────────┐
│  header                       [X]   │
├─────────────────────────────────────┤
│  Section: "Basic Info"              │
│  ┌───────────┐ ┌───────────┐       │
│  │ [Name...] │ │ [Email..] │       │
│  └───────────┘ └───────────┘       │
│  Section: "Settings"               │
│  ┌───────────────────────┐         │
│  │ [Timezone ▼]          │         │
│  └───────────────────────┘         │
├─────────────────────────────────────┤
│  footer: [Cancel]  [Save]          │
└─────────────────────────────────────┘
```

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L61)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L60)

***

### fieldVariant?

> `optional` **fieldVariant**: [`FieldVariant`](FieldVariant.md)

Defined in: [packages/ui/src/crud/form/crud-form.tsx:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L58)

***

### footer?

> `optional` **footer**: `ReactNode`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L48)

Fixed footer rendered below the scrollable content (e.g. action buttons).

***

### header?

> `optional` **header**: `ReactNode`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L46)

Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label).

***

### isSubmitting?

> `optional` **isSubmitting**: `boolean`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L50)

When true, indicates form is being submitted. Propagated via `data-submitting` attribute.

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L44)

Renders a close button (panel-right-close icon) at the right side of the header toolbar.

#### Returns

`void`

***

### onSubmit()

> **onSubmit**: (`e`) => `void`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L42)

#### Parameters

##### e

`FormEvent`\<`HTMLFormElement`\>

#### Returns

`void`

***

### variant?

> `optional` **variant**: `"page"` \| `"panel"`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L57)

Layout context. `"panel"` (default) fills its host, scrolls its own body,
and pads header/body/footer edges for the panel scrollbar. `"page"` flows
with the document — the page owns the scroll and no horizontal inset is
added, so sections align with surrounding page content.

***

### warnOnUnsavedChanges?

> `optional` **warnOnUnsavedChanges**: `boolean`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:59](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L59)
