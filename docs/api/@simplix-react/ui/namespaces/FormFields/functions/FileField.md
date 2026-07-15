[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / FileField

# Function: FileField()

> **FileField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/file-field.tsx:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/file-field.tsx#L31)

FileField — general-purpose file attachment form field.

Wraps FieldWrapper (layout default top, DEC-4 inline body div).
Hook wired to dropzone, two file sections (files / images), and 4 dialogs
(preview, description edit, delete confirm, validation errors).

§J: validationErrors are shown in a Dialog popup, not inline.
    FieldWrapper.error carries only the externally-injected error prop.

## Parameters

### \_\_namedParameters

[`FileFieldProps`](../interfaces/FileFieldProps.md)

## Returns

`Element`
