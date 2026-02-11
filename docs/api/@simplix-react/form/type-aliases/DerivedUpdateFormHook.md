[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / DerivedUpdateFormHook

# Type Alias: DerivedUpdateFormHook()\<TSchema\>

> **DerivedUpdateFormHook**\<`TSchema`\> = (`entityId`, `options?`) => [`UpdateFormReturn`](../interfaces/UpdateFormReturn.md)\<`TSchema`\>

Defined in: [types.ts:138](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/form/src/types.ts#L138)

Hook signature for updating an existing entity via a TanStack Form instance.

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodTypeAny`

Zod schema type for the entity

## Parameters

### entityId

`string`

### options?

[`UpdateFormOptions`](../interfaces/UpdateFormOptions.md)

## Returns

[`UpdateFormReturn`](../interfaces/UpdateFormReturn.md)\<`TSchema`\>

## See

 - [UpdateFormOptions](../interfaces/UpdateFormOptions.md) for available options
 - [UpdateFormReturn](../interfaces/UpdateFormReturn.md) for the return value shape
