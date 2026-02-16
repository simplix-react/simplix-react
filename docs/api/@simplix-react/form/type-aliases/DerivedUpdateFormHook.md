[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / DerivedUpdateFormHook

# Type Alias: DerivedUpdateFormHook()\<TSchema\>

> **DerivedUpdateFormHook**\<`TSchema`\> = (`entityId`, `options?`) => [`UpdateFormReturn`](../interfaces/UpdateFormReturn.md)\<`TSchema`\>

Defined in: [types.ts:138](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/form/src/types.ts#L138)

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
