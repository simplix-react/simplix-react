[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / GroupedToggleOtherInfo

# Interface: GroupedToggleOtherInfo\<T\>

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L41)

Information passed to [GroupedToggleFieldProps.renderOtherNote](GroupedToggleFieldProps.md#renderothernote).

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### all

> **all**: `T`[]

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L47)

Flattened list of all out-of-catalog selected values.

***

### byGroup

> **byGroup**: `Record`\<`string`, `T`[]\>

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L45)

Out-of-catalog selected values keyed by group id.

***

### count

> **count**: `number`

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L43)

Total count of selected values not present in any group's catalog.
