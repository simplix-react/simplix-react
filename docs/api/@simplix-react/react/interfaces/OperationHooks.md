[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / OperationHooks

# Interface: OperationHooks\<TInput, TOutput\>

Defined in: [types.ts:264](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/react/src/types.ts#L264)

Represents the hook container for a custom operation defined in the contract.

Each operation in the contract produces an object with a single `useMutation` hook.
Cache invalidation is handled automatically based on the operation's `invalidates`
configuration in the contract.

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const { mutate, isPending } = hooks.archiveProject.useMutation({
  onSuccess: () => console.log("Project archived"),
});
```

## See

[deriveHooks](../functions/deriveHooks.md) for generating hooks from a contract.

## Type Parameters

### TInput

`TInput` *extends* `z.ZodTypeAny`

The Zod schema defining the operation input

### TOutput

`TOutput` *extends* `z.ZodTypeAny`

The Zod schema defining the operation output

## Properties

### useMutation

> **useMutation**: [`OperationMutationHook`](../type-aliases/OperationMutationHook.md)\<`output`\<`TInput`\>, `output`\<`TOutput`\>\>

Defined in: [types.ts:268](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/react/src/types.ts#L268)
