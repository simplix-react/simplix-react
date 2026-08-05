[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FieldControlProps

# Interface: FieldControlProps

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L41)

Identifiers a [FieldWrapper](../functions/FieldWrapper.md) hands to the control it wraps so the label
actually names it in the accessibility tree.

- `id` — put it on a labelable control (`input`, `textarea`, `select`,
  `button`, and Radix primitives that render one). The wrapper's `<Label>`
  points its `htmlFor` here, so clicking the label focuses the control.
- `labelId` — the id of the rendered label element. Use it with
  `aria-labelledby` when the control is a composite with no single labelable
  element (radio group, time picker, rich-text editor, tag combobox).

## Properties

### id

> **id**: `string`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L43)

Id for the labelable control the label points at.

***

### labelId

> **labelId**: `string` \| `undefined`

Defined in: [packages/ui/src/fields/shared/field-wrapper.tsx:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/shared/field-wrapper.tsx#L49)

Id of the label element, for `aria-labelledby` on composite controls.
`undefined` when the field has no label — pointing `aria-labelledby` at a
missing id would blank out a name the control derives from its content.
