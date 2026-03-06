[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / createMockEntityStore

# Function: createMockEntityStore()

> **createMockEntityStore**\<`T`\>(`seeds`, `idField?`): [`MockEntityStore`](../interfaces/MockEntityStore.md)\<`T`\>

Defined in: [mock-entity-store.ts:47](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L47)

Create a typed in-memory CRUD store for mock handlers.

Uses `object` constraint (not `Record<string, unknown>`) to support
Orval-generated interfaces which lack index signatures.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### seeds

`T`[]

### idField?

`string` = `"id"`

## Returns

[`MockEntityStore`](../interfaces/MockEntityStore.md)\<`T`\>
