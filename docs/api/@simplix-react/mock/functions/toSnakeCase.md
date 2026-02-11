[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / toSnakeCase

# Function: toSnakeCase()

> **toSnakeCase**(`str`): `string`

Defined in: [sql/row-mapping.ts:44](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/sql/row-mapping.ts#L44)

Converts a camelCase string to snake_case.

## Parameters

### str

`string`

The camelCase input string.

## Returns

`string`

The snake_case equivalent.

## Example

```ts
import { toSnakeCase } from "@simplix-react/mock";

toSnakeCase("createdAt"); // "created_at"
toSnakeCase("projectId"); // "project_id"
```
