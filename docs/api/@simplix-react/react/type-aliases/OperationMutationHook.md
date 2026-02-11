[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / OperationMutationHook

# Type Alias: OperationMutationHook()\<TInput, TOutput\>

> **OperationMutationHook**\<`TInput`, `TOutput`\> = (`options?`) => `UseMutationResult`\<`TOutput`, `Error`, `TInput`\>

Defined in: [types.ts:235](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/react/src/types.ts#L235)

Represents a derived mutation hook for a custom operation.

Wraps the operation client function with TanStack Query's `useMutation`.
All mutation options except `mutationFn` can be passed through.

## Type Parameters

### TInput

`TInput`

The input type for the operation

### TOutput

`TOutput`

The output type for the operation

## Parameters

### options?

`Omit`\<`UseMutationOptions`\<`TOutput`, `Error`, `TInput`\>, `"mutationFn"`\>

## Returns

`UseMutationResult`\<`TOutput`, `Error`, `TInput`\>

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const archiveProject = hooks.archiveProject.useMutation();
archiveProject.mutate({ projectId: "abc" });
```

## See

[OperationHooks](../interfaces/OperationHooks.md) for the operation hooks container.
