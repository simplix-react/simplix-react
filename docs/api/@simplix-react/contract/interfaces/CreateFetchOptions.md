[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / CreateFetchOptions

# Interface: CreateFetchOptions

Defined in: [packages/contract/src/helpers/create-fetch.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/create-fetch.ts#L13)

## Properties

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [packages/contract/src/helpers/create-fetch.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/create-fetch.ts#L15)

Base URL prepended to relative paths. Absolute URLs bypass this.

***

### getToken()?

> `optional` **getToken**: () => `string` \| `null`

Defined in: [packages/contract/src/helpers/create-fetch.ts:18](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/create-fetch.ts#L18)

Returns a bearer token to attach as `Authorization: Bearer <token>`.

#### Returns

`string` \| `null`

***

### onError()?

> `optional` **onError**: (`context`) => `void`

Defined in: [packages/contract/src/helpers/create-fetch.ts:51](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/create-fetch.ts#L51)

Called when the response is not OK (non-2xx).
The response body is parsed as JSON when possible, otherwise raw text.
Throw a custom error to override the default [ApiError](../classes/ApiError.md).
If this function returns without throwing, the default ApiError is thrown.

#### Parameters

##### context

[`FetchErrorContext`](FetchErrorContext.md) & `object`

#### Returns

`void`

#### Example

```ts
createFetch({
  onError: ({ status, body }) => {
    const env = body as { errorCode?: string; message?: string };
    if (env.errorCode) {
      throw new MyCustomError(status, env.errorCode, env.message);
    }
  },
});
```

***

### transformResponse()?

> `optional` **transformResponse**: (`json`, `context`) => `unknown`

Defined in: [packages/contract/src/helpers/create-fetch.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/helpers/create-fetch.ts#L31)

Transforms the parsed JSON response before returning.
Receives the raw JSON and request context for endpoint-specific branching.

#### Parameters

##### json

`unknown`

##### context

[`FetchContext`](FetchContext.md)

#### Returns

`unknown`

#### Example

```ts
createFetch({
  transformResponse: (json) => (json as any).body ?? json,
});
```
