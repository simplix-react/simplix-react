[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / DerivedDeleteHook

# Type Alias: DerivedDeleteHook()

> **DerivedDeleteHook** = (`options?`) => `UseMutationResult`\<`void`, `Error`, `string`\>

Defined in: [types.ts:137](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/react/src/types.ts#L137)

Represents a derived delete mutation hook.

Accepts the entity ID as the mutation variable. Automatically invalidates
all entity queries on success.

## Parameters

### options?

`Omit`\<`UseMutationOptions`\<`void`, `Error`, `string`\>, `"mutationFn"`\>

## Returns

`UseMutationResult`\<`void`, `Error`, `string`\>

## Example

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectContract);
const deleteTask = hooks.task.useDelete();
deleteTask.mutate(taskId);
```

## See

[EntityHooks](../interfaces/EntityHooks.md) for the complete set of entity hooks.
