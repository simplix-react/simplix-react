[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / ApiAdapterOptions

# Interface: ApiAdapterOptions

Defined in: [packages/access/src/adapters/api-adapter.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/adapters/api-adapter.ts#L27)

Configuration for [createApiAdapter](../functions/createApiAdapter.md).

## Example

```ts
const options: ApiAdapterOptions = {
  endpoint: "/api/v1/user/me/permissions",
  fetchFn: auth.fetchFn,
  transformResponse: (res) => ({
    permissions: (res as any).data.permissions,
    roles: (res as any).data.roles,
  }),
};
```

## Properties

### endpoint?

> `optional` **endpoint**: `string`

Defined in: [packages/access/src/adapters/api-adapter.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/adapters/api-adapter.ts#L29)

API endpoint to fetch permissions from. Defaults to `"/api/me/permissions"`.

***

### fetchFn?

> `optional` **fetchFn**: [`FetchFn`](../type-aliases/FetchFn.md)

Defined in: [packages/access/src/adapters/api-adapter.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/adapters/api-adapter.ts#L31)

Custom fetch function. Defaults to the global `fetch`.

***

### transformResponse()?

> `optional` **transformResponse**: (`response`) => `object`

Defined in: [packages/access/src/adapters/api-adapter.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/adapters/api-adapter.ts#L33)

Custom response transformer.

#### Parameters

##### response

`unknown`

#### Returns

`object`

##### isSuperAdmin?

> `optional` **isSuperAdmin**: `boolean`

##### permissions

> **permissions**: [`PermissionMap`](PermissionMap.md)

##### roles?

> `optional` **roles**: `string`[]

##### user?

> `optional` **user**: `Partial`\<[`AccessUser`](AccessUser.md)\<`Record`\<`string`, `unknown`\>\>\>
