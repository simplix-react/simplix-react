[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityId

# Type Alias: EntityId

> **EntityId** = `string` \| `Record`\<`string`, `string`\>

Defined in: [packages/contract/src/types.ts:465](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L465)

Represents an entity identifier that supports both simple string IDs
and composite keys (e.g. tenant ID + item ID).

## Example

```ts
// Simple string ID
const id: EntityId = "abc-123";

// Composite key
const compositeId: EntityId = { tenantId: "t1", itemId: "i1" };
```
