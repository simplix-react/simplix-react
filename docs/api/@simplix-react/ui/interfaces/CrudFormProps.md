[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudFormProps

# Interface: CrudFormProps

Defined in: packages/ui/src/crud/form/crud-form.tsx:19

Props for the [CrudForm](../variables/CrudForm.md) compound component root.

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: packages/ui/src/crud/form/crud-form.tsx:28

***

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/form/crud-form.tsx:27

***

### fieldVariant?

> `optional` **fieldVariant**: [`FieldVariant`](FieldVariant.md)

Defined in: packages/ui/src/crud/form/crud-form.tsx:25

***

### header?

> `optional` **header**: `ReactNode`

Defined in: packages/ui/src/crud/form/crud-form.tsx:24

Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label).

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: packages/ui/src/crud/form/crud-form.tsx:22

Renders a close button (panel-right-close icon) at the right side of the header toolbar.

#### Returns

`void`

***

### onSubmit()

> **onSubmit**: (`e`) => `void`

Defined in: packages/ui/src/crud/form/crud-form.tsx:20

#### Parameters

##### e

`FormEvent`\<`HTMLFormElement`\>

#### Returns

`void`

***

### warnOnUnsavedChanges?

> `optional` **warnOnUnsavedChanges**: `boolean`

Defined in: packages/ui/src/crud/form/crud-form.tsx:26
