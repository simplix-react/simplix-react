[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / toCamelCase

# Function: toCamelCase()

> **toCamelCase**(`str`): `string`

Defined in: [sql/row-mapping.ts:26](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/sql/row-mapping.ts#L26)

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
