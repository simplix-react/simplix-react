[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / GroupedToggleOtherInfo

# Interface: GroupedToggleOtherInfo\<T\>

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L40)

Information passed to [GroupedToggleFieldProps.renderOtherNote](GroupedToggleFieldProps.md#renderothernote).

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### all

> **all**: `T`[]

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L46)

Flattened list of all out-of-catalog selected values.

***

### byGroup

> **byGroup**: `Record`\<`string`, `T`[]\>

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L44)

Out-of-catalog selected values keyed by group id.

***

### count

> **count**: `number`

Defined in: [packages/ui/src/fields/form/grouped-toggle-field.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/grouped-toggle-field.tsx#L42)

Total count of selected values not present in any group's catalog.
