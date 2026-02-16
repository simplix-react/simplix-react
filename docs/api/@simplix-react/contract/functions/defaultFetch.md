[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / defaultFetch

# Function: defaultFetch()

> **defaultFetch**\<`T`\>(`path`, `options?`): `Promise`\<`T`\>

Defined in: [packages/contract/src/helpers/fetch.ts:67](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/helpers/fetch.ts#L67)

Performs an HTTP request with automatic JSON content-type headers and
`{ data: T }` envelope unwrapping.

Serves as the built-in fetch implementation used by [deriveClient](deriveClient.md)
when no custom `fetchFn` is provided. Returns `undefined` for 204 No Content
responses and throws [ApiError](../classes/ApiError.md) for non-2xx status codes.

## Type Parameters

### T

`T`

The expected deserialized response type.

## Parameters

### path

`string`

The full URL path to fetch.

### options?

`RequestInit`

Standard `RequestInit` options forwarded to the native `fetch`.

## Returns

`Promise`\<`T`\>

The unwrapped response data.

## Throws

[ApiError](../classes/ApiError.md) When the response status is not OK.

## Example

```ts
import { defineApi, defaultFetch } from "@simplix-react/contract";

// Use as-is (default behavior)
const api = defineApi(config);

// Or provide a custom wrapper
const api = defineApi(config, {
  fetchFn: async (path, options) => {
    // Add auth header, then delegate to defaultFetch
    return defaultFetch(path, {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${token}` },
    });
  },
});
```
