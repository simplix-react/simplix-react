[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / DerivedCreateFormHook

# Type Alias: DerivedCreateFormHook()\<TCreate\>

> **DerivedCreateFormHook**\<`TCreate`\> = (`parentId?`, `options?`) => [`CreateFormReturn`](../interfaces/CreateFormReturn.md)

Defined in: [types.ts:109](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/form/src/types.ts#L109)

Hook signature for creating a new entity via a TanStack Form instance.

## Type Parameters

### TCreate

`TCreate` *extends* `z.ZodTypeAny`

Zod schema type for the create DTO

## Parameters

### parentId?

`string`

### options?

[`CreateFormOptions`](../interfaces/CreateFormOptions.md)\<`TCreate`\>

## Returns

[`CreateFormReturn`](../interfaces/CreateFormReturn.md)

## See

 - [CreateFormOptions](../interfaces/CreateFormOptions.md) for available options
 - [CreateFormReturn](../interfaces/CreateFormReturn.md) for the return value shape
