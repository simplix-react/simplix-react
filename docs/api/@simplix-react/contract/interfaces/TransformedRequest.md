[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / TransformedRequest

# Interface: TransformedRequest

Defined in: [packages/contract/src/types.ts:191](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L191)

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

Defined in: [packages/contract/src/types.ts:195](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L195)

Override request body. `null` = explicitly no body, `undefined` = default behavior.

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [packages/contract/src/types.ts:193](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L193)

Override or add request headers. Merged OVER auth scheme headers.

***

### url?

> `optional` **url**: `string`

Defined in: [packages/contract/src/types.ts:197](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L197)

Override or replace the URL (e.g., add query params).
