[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / interpolatePath

# Function: interpolatePath()

> **interpolatePath**(`path`, `params`): `string`

Defined in: [packages/contract/src/helpers/path-params.ts:35](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/helpers/path-params.ts#L35)

Substitutes `:paramName` placeholders in a URL path with actual values.

## Parameters

### path

`string`

URL path template with `:paramName` placeholders.

### params

`Record`\<`string`, `string`\>

Map of parameter names to their string values.

## Returns

`string`

The resolved URL path with all placeholders replaced.

## Throws

Error if a required path parameter is missing.

## Example

```ts
interpolatePath("/products/:id", { id: "abc" });
// "/products/abc"
```
