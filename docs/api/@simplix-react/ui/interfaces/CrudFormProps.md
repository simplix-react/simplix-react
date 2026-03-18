[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudFormProps

# Interface: CrudFormProps

Defined in: [packages/ui/src/crud/form/crud-form.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L39)

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

Defined in: [packages/ui/src/crud/form/crud-form.tsx:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L52)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L51)

***

### fieldVariant?

> `optional` **fieldVariant**: [`FieldVariant`](FieldVariant.md)

Defined in: [packages/ui/src/crud/form/crud-form.tsx:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L49)

***

### footer?

> `optional` **footer**: `ReactNode`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L46)

Fixed footer rendered below the scrollable content (e.g. action buttons).

***

### header?

> `optional` **header**: `ReactNode`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L44)

Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label).

***

### isSubmitting?

> `optional` **isSubmitting**: `boolean`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L48)

When true, indicates form is being submitted. Propagated via `data-submitting` attribute.

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L42)

Renders a close button (panel-right-close icon) at the right side of the header toolbar.

#### Returns

`void`

***

### onSubmit()

> **onSubmit**: (`e`) => `void`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L40)

#### Parameters

##### e

`FormEvent`\<`HTMLFormElement`\>

#### Returns

`void`

***

### warnOnUnsavedChanges?

> `optional` **warnOnUnsavedChanges**: `boolean`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:50](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L50)
