[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / createFileFieldApi

# Function: createFileFieldApi()

> **createFileFieldApi**(`source`): [`FileFieldApi`](../interfaces/FileFieldApi.md)

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L24)

Builds a [FileFieldApi](../interfaces/FileFieldApi.md) for the standard per-module attachment endpoints.

The screen passes only its module attachment address ([FileFieldSource](../interfaces/FileFieldSource.md));
this wires the uniform endpoint shape

  {basePath}/{id}/attachment/{group}/{op}

where `{id}` is the saved `entityId`, or `TEMP_<tempEntityId>` for a pre-save
upload the backend links on create.

JSON ops (list/delete/reorder/representative/description) go through the
host-registered mutator (default strategy `"boot"`). Upload and blob reads use
the host-registered [AttachmentTransport](../interfaces/AttachmentTransport.md) when present — giving real
upload progress and authenticated blob bytes — and fall back to the mutator
(terminal progress, public `url`) otherwise.

## Parameters

### source

[`FileFieldSource`](../interfaces/FileFieldSource.md)

## Returns

[`FileFieldApi`](../interfaces/FileFieldApi.md)
