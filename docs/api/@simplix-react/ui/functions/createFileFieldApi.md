[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / createFileFieldApi

# Function: createFileFieldApi()

> **createFileFieldApi**(`options`): `FileFieldApi`

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L60)

Builds a FileFieldApi backed by the common attachment endpoints. The
caller passes only entityType + entityId + group + permissionKey; this wires
upload/list/delete and the shared metadata operations.

## Parameters

### options

[`CreateFileFieldApiOptions`](../interfaces/CreateFileFieldApiOptions.md)

## Returns

`FileFieldApi`
