# @simplix-boot/access

Spring Security authorization adapter for `@simplix-react/access`. Converts Spring Security permission responses into CASL rules and provides a ready-to-use `AccessAdapter`.

## Installation

```bash
pnpm add @simplix-boot/access
```

> **Prerequisites:** Requires `@simplix-react/access` and `@simplix-react/contract` as peer dependencies.

## Usage

### Create Access Adapter

`createSpringAccessAdapter()` returns an `AccessAdapter` that fetches permissions from Spring Security endpoints and converts them to CASL rules:

```ts
import { createAccess } from "@simplix-react/access";
import { createSpringAccessAdapter } from "@simplix-boot/access";

const adapter = createSpringAccessAdapter({
  permissionsEndpoint: "/api/v1/user/me/permissions",
  publicPermissionsEndpoint: "/api/v1/public/user/permissions",
  systemAdminRole: "ROLE_SYSTEM_ADMIN",
  fetchFn: auth.fetchFn,
});

const access = createAccess({ adapter });
```

### Convert Permissions Directly

If you need to convert a Spring permissions response without the full adapter:

```ts
import { convertSpringPermissionsToCasl } from "@simplix-boot/access";

const result = convertSpringPermissionsToCasl({
  permissions: { Pet: ["list", "view"], Order: ["list", "create"] },
  roles: ["ROLE_USER", { roleCode: "ROLE_ADMIN", roleName: "Admin" }],
  isSuperAdmin: false,
});

// result.rules:
// [
//   { action: "list", subject: "Pet" },
//   { action: "view", subject: "Pet" },
//   { action: "list", subject: "Order" },
//   { action: "create", subject: "Order" },
// ]
// result.roles: ["ROLE_USER", "ROLE_ADMIN"]
// result.isSuperAdmin: false
```

When `isSuperAdmin` is `true` (or `"true"`), a `{ action: "manage", subject: "all" }` rule is prepended automatically.

### Check Backoffice Access

A utility to check if the current user has backoffice access:

```ts
import { hasBackofficeAccess } from "@simplix-boot/access";

hasBackofficeAccess(rules, true);              // true (super admin bypasses)
hasBackofficeAccess(rules, false);             // checks for BACKOFFICE_ACCESS resource
hasBackofficeAccess(rules, false, "MY_PANEL"); // checks for custom resource
```

## API Reference

### `createSpringAccessAdapter(options?)`

Creates an `AccessAdapter` for Spring Security permission endpoints.

**Options (`SpringAccessAdapterOptions`):**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `permissionsEndpoint` | `string` | `"/api/v1/user/me/permissions"` | Authenticated permissions endpoint |
| `publicPermissionsEndpoint` | `string` | `"/api/v1/public/user/permissions"` | Public permissions endpoint |
| `systemAdminRole` | `string` | `"ROLE_SYSTEM_ADMIN"` | Role code that identifies a system admin |
| `fetchFn` | `FetchFn` | `defaultFetch` | Custom fetch function |

**Behavior:**

- When `authData` is `null` or `undefined`, fetches from `publicPermissionsEndpoint`
- Otherwise fetches from `permissionsEndpoint`
- If `systemAdminRole` is found in the user's roles, a `{ action: "manage", subject: "all" }` rule is added automatically
- Missing fields in the response (`permissions`, `roles`, `isSuperAdmin`) are safely defaulted to empty values (`{}`, `[]`, `false`)

**Note on the `user` field in `extract()` result:**

The `user` object returned by `extract()` has empty strings for `userId` and `username`, because the permissions endpoint does not include user identification data. If you need user info, fetch it separately via `@simplix-boot/auth`'s `userInfoFn`.

```ts
// Fetch user info from the auth adapter
const user = await spring.userInfoFn(accessToken);

// The permissions adapter only provides rules/roles/isSuperAdmin
const { rules, roles, user: accessUser } = await adapter.extract(authData);
// accessUser.userId === ""  (not provided by the permissions endpoint)
```

### `convertSpringPermissionsToCasl(response)`

Converts a `SpringPermissionsResponse` into CASL rules.

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `response` | `SpringPermissionsResponse` | Spring Security permissions response |

**Returns (`SpringConvertResult`):**

| Field | Type | Description |
| --- | --- | --- |
| `rules` | `AccessRule<string, string>[]` | CASL-compatible rules |
| `roles` | `string[]` | Normalized role strings |
| `isSuperAdmin` | `boolean` | Whether the user is a super admin |

### `hasBackofficeAccess(rules, isSuperAdmin?, resource?)`

Checks whether the given rules grant backoffice access.

**Parameters:**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `rules` | `AccessRule<string, string>[]` | - | CASL rules to check |
| `isSuperAdmin` | `boolean` | `false` | Super admin bypass |
| `resource` | `string` | `"BACKOFFICE_ACCESS"` | Resource name to check |

Returns `true` if `isSuperAdmin` is `true`, or if any rule targets the specified resource or `"all"`.

### Types

#### `SpringPermissionsResponse`

```ts
interface SpringPermissionsResponse {
  permissions: Record<string, string[]>;
  roles: Array<string | { roleCode: string; roleName: string }>;
  isSuperAdmin: boolean | string;
}
```

#### `SpringAccessAdapterOptions`

See [createSpringAccessAdapter options](#createspringaccessadapteroptions) above.

#### `SpringConvertResult`

```ts
interface SpringConvertResult {
  rules: AccessRule<string, string>[];
  roles: string[];
  isSuperAdmin: boolean;
}
```

## Error Handling

Errors thrown by `fetchFn` propagate directly to the caller. There is no built-in retry or error transformation logic. If you need error interceptors, pass a custom fetch function via the `fetchFn` option.

> **Prerequisites:** Set up authentication first with `@simplix-boot/auth`.
> See [@simplix-boot/auth](../auth/README.md).
