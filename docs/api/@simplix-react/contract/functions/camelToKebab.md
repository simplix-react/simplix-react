[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / camelToKebab

# Function: camelToKebab()

> **camelToKebab**(`str`): `string`

Defined in: [packages/contract/src/helpers/case-transform.ts:17](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/helpers/case-transform.ts#L17)

Converts a camelCase string to kebab-case.

Used internally for transforming entity names into URL-friendly path segments.

## Parameters

### str

`string`

The camelCase string to convert.

## Returns

`string`

The kebab-case equivalent.

## Example

```ts
import { camelToKebab } from "@simplix-react/contract";

camelToKebab("doorReader");  // "door-reader"
camelToKebab("myEntity");    // "my-entity"
```
