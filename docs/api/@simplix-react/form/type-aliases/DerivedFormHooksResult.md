[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / DerivedFormHooksResult

# Type Alias: DerivedFormHooksResult\<TEntities\>

> **DerivedFormHooksResult**\<`TEntities`\> = `{ [K in keyof TEntities]: EntityFormHooks<TEntities[K]["schema"]> }`

Defined in: [derive-form-hooks.ts:69](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/form/src/derive-form-hooks.ts#L69)

Mapped type that produces per-entity [EntityFormHooks](../interfaces/EntityFormHooks.md) from the contract's entity map.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>
