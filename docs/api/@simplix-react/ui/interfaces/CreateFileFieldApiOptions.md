[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CreateFileFieldApiOptions

# Interface: CreateFileFieldApiOptions

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L37)

Options for [createFileFieldApi](../functions/createFileFieldApi.md). The calling screen supplies the entity
coordinates and its own permission key; upload/list go to the common
attachment endpoints, which check that key server-side. Reorder / description /
representative / blob reads use the common attachmentId-keyed endpoints.

## Properties

### entityId

> **entityId**: `string`

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L43)

Owning entity id (permanent), or the temp id when [temp](#temp) is true.

***

### entityType

> **entityType**: `string`

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L41)

Owning entity type, e.g. "Popup".

***

### group

> **group**: `string`

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L45)

Attachment group/slot, e.g. "banner".

***

### http

> **http**: [`AttachmentHttpClient`](AttachmentHttpClient.md)

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L39)

Host HTTP client (e.g. the app's configured axios instance).

***

### permissionKey

> **permissionKey**: `string`

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L47)

Permission key of the calling screen, e.g. "ADMIN_CMS_POPUP".

***

### temp?

> `optional` **temp**: `boolean`

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L49)

Use the pre-save temp upload endpoint (UPLOADING) instead of the immediate one.
