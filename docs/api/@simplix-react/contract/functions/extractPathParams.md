[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / extractPathParams

# Function: extractPathParams()

> **extractPathParams**(`path`): `string`[]

Defined in: [packages/contract/src/helpers/path-params.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/path-params.ts#L16)

Extracts `:paramName` placeholders from a URL path template.

## Parameters

### path

`string`

URL path template with `:paramName` placeholders.

## Returns

`string`[]

Array of parameter names found in the path.

## Example

```ts
extractPathParams("/products/:id");
// ["id"]

extractPathParams("/tenants/:tenantId/products/:productId");
// ["tenantId", "productId"]
```
