[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / DerivedUpdateFormHook

# Type Alias: DerivedUpdateFormHook()\<TSchema\>

> **DerivedUpdateFormHook**\<`TSchema`\> = (`entityId`, `options?`) => [`UpdateFormReturn`](../interfaces/UpdateFormReturn.md)\<`TSchema`\>

Defined in: [types.ts:144](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L144)

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
