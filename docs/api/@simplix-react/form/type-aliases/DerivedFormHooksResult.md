[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / DerivedFormHooksResult

# Type Alias: DerivedFormHooksResult\<TEntities\>

> **DerivedFormHooksResult**\<`TEntities`\> = `{ [K in keyof TEntities]: EntityFormHooks<TEntities[K]["schema"], TEntities[K]["createSchema"]> }`

Defined in: [derive-form-hooks.ts:65](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/form/src/derive-form-hooks.ts#L65)

Mapped type that produces per-entity [EntityFormHooks](../interfaces/EntityFormHooks.md) from the contract's entity map.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>
