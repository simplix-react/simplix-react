[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityPatch

# Interface: EntityPatch

Defined in: [packages/contract/src/customize-api.ts:17](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/customize-api.ts#L17)

Patch descriptor for a single entity's operations.

- `null` removes the operation from the entity.
- An [EntityOperationDef](EntityOperationDef.md) object adds or replaces the operation.

## Properties

### operations?

> `optional` **operations**: `Record`\<`string`, [`EntityOperationDef`](EntityOperationDef.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\> \| `null`\>

Defined in: [packages/contract/src/customize-api.ts:18](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/customize-api.ts#L18)
