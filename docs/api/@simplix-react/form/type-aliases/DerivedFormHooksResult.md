[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / DerivedFormHooksResult

# Type Alias: DerivedFormHooksResult\<TEntities\>

> **DerivedFormHooksResult**\<`TEntities`\> = `{ [K in keyof TEntities]: EntityFormHooks<TEntities[K]["schema"]> }`

Defined in: [derive-form-hooks.ts:69](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/form/src/derive-form-hooks.ts#L69)

Mapped type that produces per-entity [EntityFormHooks](../interfaces/EntityFormHooks.md) from the contract's entity map.

## Type Parameters

### TEntities

`TEntities` *extends* `Record`\<`string`, `AnyEntityDef`\>
