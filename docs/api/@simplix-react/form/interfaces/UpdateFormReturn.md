[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / UpdateFormReturn

# Interface: UpdateFormReturn\<TSchema\>

Defined in: [types.ts:92](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L92)

Return value of the `useUpdateForm` hook.

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodTypeAny`

Zod schema type for the entity

## Properties

### entity

> **entity**: `output`\<`TSchema`\> \| `undefined`

Defined in: [types.ts:102](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L102)

The loaded entity data, or `undefined` while loading.

***

### form

> **form**: `AnyFormApi`

Defined in: [types.ts:94](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L94)

TanStack Form API instance for field binding and submission.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [types.ts:96](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L96)

Whether the entity data is still loading from the server.

***

### isSubmitting

> **isSubmitting**: `boolean`

Defined in: [types.ts:98](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L98)

Whether the update mutation is currently in flight.

***

### submitError

> **submitError**: `Error` \| `null`

Defined in: [types.ts:100](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L100)

The most recent submission error, or `null` if the last attempt succeeded.
