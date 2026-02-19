[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / ApiPatch

# Interface: ApiPatch

Defined in: packages/contract/src/customize-api.ts:27

Patch descriptor applied to an API contract via [customizeApi](../functions/customizeApi.md).

Only the `entities` field is supported. Each key maps to an entity name
from the base contract, and the value describes operation-level changes.

## Properties

### entities?

> `optional` **entities**: `Record`\<`string`, [`EntityPatch`](EntityPatch.md)\>

Defined in: packages/contract/src/customize-api.ts:28
