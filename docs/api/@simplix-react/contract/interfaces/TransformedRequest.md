[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / TransformedRequest

# Interface: TransformedRequest

Defined in: [packages/contract/src/types.ts:129](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L129)

Describes how to override the default HTTP request built by the client.

Returned from [EntityOperationDef.transformRequest](EntityOperationDef.md#transformrequest) or
[OperationDefinition.transformRequest](OperationDefinition.md#transformrequest) to customize headers, body,
or URL for non-standard HTTP patterns (Basic Auth, form-encoded, query params, etc.).

## Example

```ts
// Basic Auth
transformRequest: (input) => ({
  headers: { Authorization: `Basic ${btoa(`${input.username}:${input.password}`)}` },
})

// Form-encoded body
transformRequest: (input) => ({
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(input).toString(),
})

// Query params
transformRequest: (input, url) => ({
  url: `${url}?${new URLSearchParams(input).toString()}`,
})
```

## Properties

### body?

> `optional` **body**: `BodyInit` \| `null`

Defined in: [packages/contract/src/types.ts:133](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L133)

Override request body. `null` = explicitly no body, `undefined` = default behavior.

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [packages/contract/src/types.ts:131](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L131)

Override or add request headers. Merged OVER auth scheme headers.

***

### url?

> `optional` **url**: `string`

Defined in: [packages/contract/src/types.ts:135](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L135)

Override or replace the URL (e.g., add query params).
