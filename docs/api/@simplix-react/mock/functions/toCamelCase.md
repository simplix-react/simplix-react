[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / toCamelCase

# Function: toCamelCase()

> **toCamelCase**(`str`): `string`

Defined in: sql/row-mapping.ts:26

Converts a snake_case string to camelCase.

## Parameters

### str

`string`

The snake_case input string.

## Returns

`string`

The camelCase equivalent.

## Example

```ts
import { toCamelCase } from "@simplix-react/mock";

toCamelCase("created_at"); // "createdAt"
toCamelCase("project_id"); // "projectId"
```
