[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / DerivedCreateFormHook

# Type Alias: DerivedCreateFormHook()\<TCreate\>

> **DerivedCreateFormHook**\<`TCreate`\> = (`parentId?`, `options?`) => [`CreateFormReturn`](../interfaces/CreateFormReturn.md)

Defined in: [types.ts:125](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/form/src/types.ts#L125)

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
