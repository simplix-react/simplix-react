[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / customizeApi

# Function: customizeApi()

> **customizeApi**\<`TEntities`, `TOperations`\>(`base`, `patch`, `options?`): `object`

Defined in: packages/contract/src/customize-api.ts:66

Creates a patched copy of an API contract by adding, replacing, or removing
entity operations.

The base contract is never mutated. A new contract is returned with
re-derived `client` and `queryKeys` reflecting the patched configuration.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, [`EntityDefinition`](../interfaces/EntityDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `Record`\<`string`, [`EntityOperationDef`](../interfaces/EntityOperationDef.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>\>\>

### TOperations

`TOperations` *extends* `Record`\<`string`, [`OperationDefinition`](../interfaces/OperationDefinition.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\> = `Record`\<`string`, `never`\>

## Parameters

### base

The original contract returned by [defineApi](defineApi.md), or any object with a `config` property.

#### config

[`ApiContractConfig`](../interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\>

### patch

[`ApiPatch`](../interfaces/ApiPatch.md)

An [ApiPatch](../interfaces/ApiPatch.md) describing the changes to apply.

### options?

Optional settings forwarded to the derived client.

#### fetchFn?

[`FetchFn`](../type-aliases/FetchFn.md)

Custom fetch function; defaults to the built-in [defaultFetch](defaultFetch.md).

## Returns

`object`

A new contract object with `config`, `client`, and `queryKeys`.

### client

> **client**: `Record`\<`string`, `unknown`\>

### config

> **config**: [`ApiContractConfig`](../interfaces/ApiContractConfig.md)\<`TEntities`, `TOperations`\> = `patchedConfig`

### queryKeys

> **queryKeys**: \{ \[K in string \| number \| symbol\]: QueryKeyFactory \}

## Example

```ts
import { customizeApi } from "@simplix-react/contract";
import { petApi as _petApi } from "./generated/contract.js";

export const petApi = customizeApi(_petApi, {
  entities: {
    pet: {
      operations: {
        // Replace the list operation with a custom path
        list: { method: "GET", path: "/pet/findByStatus", role: "list" },
        // Remove operations that are no longer needed
        findByStatus: null,
        findByTags: null,
      },
    },
  },
});
```

## See

[defineApi](defineApi.md) for creating the base contract.
