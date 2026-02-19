[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedDeleteHook

# Type Alias: DerivedDeleteHook()

> **DerivedDeleteHook** = (`options?`) => `UseMutationResult`\<`void`, `Error`, `EntityId`\>

Defined in: [types.ts:137](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/react/src/types.ts#L137)

Represents a derived delete mutation hook.

Accepts the entity ID as the mutation variable. Automatically invalidates
all entity queries on success.

## Parameters

### options?

`Omit`\<`UseMutationOptions`\<`void`, `Error`, `EntityId`\>, `"mutationFn"`\>

## Returns

`UseMutationResult`\<`void`, `Error`, `EntityId`\>

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const deleteTask = hooks.task.useDelete();
deleteTask.mutate(taskId);
```

## See

[EntityHooks](EntityHooks.md) for the complete set of entity hooks.
