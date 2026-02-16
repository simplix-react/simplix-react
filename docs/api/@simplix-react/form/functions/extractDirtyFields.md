[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / extractDirtyFields

# Function: extractDirtyFields()

> **extractDirtyFields**\<`T`\>(`current`, `original`): `Partial`\<`T`\>

Defined in: [utils/dirty-fields.ts:59](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/form/src/utils/dirty-fields.ts#L59)

Extracts only the fields that differ between current and original objects.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

## Parameters

### current

`T`

The current form values

### original

`T`

The original entity data loaded from the server

## Returns

`Partial`\<`T`\>

A partial object containing only the changed fields

## Remarks

Compares each top-level key using `deepEqual`. Only keys present in
`current` are checked — removed keys are not tracked.
Useful for PATCH requests where only changed fields should be sent.

## Example

```ts
import { extractDirtyFields } from "@simplix-react/form";

const dirty = extractDirtyFields(
  { name: "Updated", status: "active", priority: 1 },
  { name: "Original", status: "active", priority: 1 },
);
// => { name: "Updated" }
```

## See

`deepEqual` (internal) — the comparison function used internally
