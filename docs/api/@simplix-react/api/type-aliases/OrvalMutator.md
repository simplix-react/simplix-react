[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / OrvalMutator

# Type Alias: OrvalMutator()

> **OrvalMutator** = \<`T`\>(`url`, `options?`) => `Promise`\<`T`\>

Defined in: [packages/api/src/index.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L15)

Fetch function signature used by Orval-generated API clients.

## Type Parameters

### T

`T`

Expected response body type.

## Parameters

### url

`string`

### options?

`RequestInit`

## Returns

`Promise`\<`T`\>

## Example

```ts
const fetcher: OrvalMutator = async (url, options) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new HttpError(res.status, res.statusText);
  return res.json();
};
```
