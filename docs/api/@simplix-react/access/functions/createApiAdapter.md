[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / createApiAdapter

# Function: createApiAdapter()

> **createApiAdapter**(`options?`): [`AccessAdapter`](../interfaces/AccessAdapter.md)

Defined in: [packages/access/src/adapters/api-adapter.ts:77](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/api-adapter.ts#L77)

Creates an adapter that fetches access rules from an API endpoint.

## Parameters

### options?

[`ApiAdapterOptions`](../interfaces/ApiAdapterOptions.md) = `{}`

API adapter configuration. All fields are optional.

## Returns

[`AccessAdapter`](../interfaces/AccessAdapter.md)

An [AccessAdapter](../interfaces/AccessAdapter.md) that fetches rules from the configured endpoint.

## Remarks

The default response format is `{ permissions: PermissionMap }`.
Also handles nested `{ body: { permissions } }` structures automatically.
Use `transformResponse` to parse custom server response shapes.

Inject `auth.fetchFn` as the `fetchFn` option to automatically
attach authorization headers to the request.

## Example

```ts
import { createApiAdapter } from "@simplix-react/access";

const adapter = createApiAdapter({
  endpoint: "/api/v1/user/me/permissions",
  fetchFn: auth.fetchFn,
  transformResponse: (res) => ({
    permissions: (res as any).data.permissions,
    roles: (res as any).data.roles,
  }),
});
```

## See

[ApiAdapterOptions](../interfaces/ApiAdapterOptions.md) for all configuration options.
