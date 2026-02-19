[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / camelToSnake

# Function: camelToSnake()

> **camelToSnake**(`str`): `string`

Defined in: [packages/contract/src/helpers/case-transform.ts:19](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/contract/src/helpers/case-transform.ts#L19)

Converts a camelCase string to snake_case.

Also handles hyphenated and space-separated inputs by replacing them with
underscores before lowercasing.

## Parameters

### str

`string`

The camelCase string to convert.

## Returns

`string`

The snake_case equivalent.

## Example

```ts
import { camelToSnake } from "@simplix-react/contract";

camelToSnake("doorReader");  // "door_reader"
camelToSnake("myEntity");    // "my_entity"
camelToSnake("some-field");  // "some_field"
```
