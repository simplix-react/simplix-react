[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / camelToKebab

# Function: camelToKebab()

> **camelToKebab**(`str`): `string`

Defined in: [packages/contract/src/helpers/case-transform.ts:17](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/contract/src/helpers/case-transform.ts#L17)

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
