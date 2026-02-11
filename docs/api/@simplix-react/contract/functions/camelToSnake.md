[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / camelToSnake

# Function: camelToSnake()

> **camelToSnake**(`str`): `string`

Defined in: [packages/contract/src/helpers/case-transform.ts:37](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/helpers/case-transform.ts#L37)

Converts a camelCase string to snake_case.

Used internally for transforming entity names into database-friendly column names.

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
```
