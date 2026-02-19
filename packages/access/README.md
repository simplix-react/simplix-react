# @simplix-react/access

Opt-in authorization and access control powered by [CASL](https://casl.js.org/).

Define who can do what. Derive everything else.

## Features

- **Adapter-based** — JWT, REST API, or static rules. Bring your own auth source.
- **Framework-agnostic core** — Works without React. Add `/react` for bindings.
- **Opt-in** — No `AccessProvider`? Permission checks default to `true`.
- **Super-admin bypass** — Flag or custom checker grants `manage:all`.
- **Persistence** — Persist and rehydrate access state across page reloads.
- **Auth auto-sync** — Subscribes to `@simplix-react/auth` state changes automatically.
- **Type-safe** — Generic `TActions` and `TSubjects` parameters narrow permissions.

## Installation

```bash
pnpm add @simplix-react/access @casl/ability
```

React bindings require `react >= 18`:

```bash
pnpm add react
```

For auto-sync with `@simplix-react/auth`:

```bash
pnpm add @simplix-react/auth
```

## Quick Example

```ts
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createApiAdapter({
    endpoint: "/api/v1/user/me/permissions",
  }),
});

// After login
await policy.update(null);

policy.can("view", "Pet");    // true
policy.cannot("delete", "Pet"); // true
policy.hasRole("ADMIN");       // true
```

With React:

```tsx
import { AccessProvider, useCan, Can } from "@simplix-react/access/react";

function App() {
  return (
    <AccessProvider policy={policy} auth={auth}>
      <PetList />
    </AccessProvider>
  );
}

function PetList() {
  const canCreate = useCan("create", "Pet");

  return (
    <div>
      {canCreate && <CreateButton />}
      <Can I="delete" a="Pet">
        <DeleteButton />
      </Can>
    </div>
  );
}
```

## Exports

The package provides two entry points:

| Entry | Import path | Requires React |
| --- | --- | --- |
| Core | `@simplix-react/access` | No |
| React | `@simplix-react/access/react` | Yes |

## API Overview

### Core (`@simplix-react/access`)

| Export | Kind | Description |
| --- | --- | --- |
| `createAccessPolicy` | Function | Creates an `AccessPolicy` backed by CASL |
| `createJwtAdapter` | Function | Extracts rules from JWT claims |
| `createApiAdapter` | Function | Fetches rules from a REST endpoint |
| `createStaticAdapter` | Function | Returns hardcoded rules (testing/dev) |
| `normalizePermissionMap` | Function | `{ Resource: [actions] }` to CASL rules |
| `normalizeFlatPermissions` | Function | `["RESOURCE:action"]` to CASL rules |
| `normalizeScopePermissions` | Function | OAuth2 scope string to CASL rules |
| `normalizeRole` | Function | Ensures `ROLE_` prefix |
| `hasRole` | Function | Checks role with prefix normalization |
| `hasAnyRole` | Function | Checks if any role matches |
| `AccessDeniedError` | Class | Thrown by `requireAccess` on failure |

### React (`@simplix-react/access/react`)

| Export | Kind | Description |
| --- | --- | --- |
| `AccessProvider` | Component | Provides policy to the tree, syncs with auth |
| `useCan` | Hook | Returns `boolean` for a permission check |
| `useAccess` | Hook | Returns the full `AccessPolicy` object |
| `Can` | Component | Declarative permission guard |
| `requireAccess` | Function | Route guard for TanStack Router `beforeLoad` |
| `useMenuFilter` | Hook | Recursively filters menu trees by permission |

### Types

| Type | Description |
| --- | --- |
| `AccessPolicy` | Main policy interface (`can`, `cannot`, `user`, `roles`, ...) |
| `AccessPolicyConfig` | Configuration for `createAccessPolicy` |
| `AccessAdapter` | Adapter interface with `extract(authData)` method |
| `AccessExtractResult` | Return type of `extract` |
| `AccessRule` | CASL raw rule (action + subject) |
| `AccessUser` | User info (userId, username, roles, isSuperAdmin) |
| `AccessSnapshot` | Serializable state snapshot |
| `PermissionMap` | `{ [resource]: string[] }` map |
| `DefaultActions` | `"list" \| "view" \| "create" \| "edit" \| "delete" \| ...` |
| `AuthLike` | Minimal auth interface for auto-sync |
| `CanProps` | Props for `Can` component |
| `RouteGuardOptions` | Options for `requireAccess` |

## Key Concepts

### AccessPolicy

The central object managing CASL ability, user info, and roles.

```ts
const policy = createAccessPolicy({
  adapter,            // Required — how to extract rules
  publicAccess,       // Optional — rules for unauthenticated users
  isSuperAdmin,       // Optional — custom super-admin checker
  persist,            // Optional — localStorage persistence
});
```

**Methods:**

| Method | Description |
| --- | --- |
| `can(action, subject)` | Returns `true` if the action is allowed |
| `cannot(action, subject)` | Inverse of `can` |
| `hasRole(role)` | Checks role with `ROLE_` prefix normalization |
| `hasAnyRole(roles)` | Checks if the user has any of the given roles |
| `update(authData)` | Extracts rules via adapter and applies them |
| `setRules(rules, user?, roles?)` | Directly sets rules without adapter |
| `clear()` | Resets all state and clears persistence |
| `loadPublicAccess()` | Loads unauthenticated access rules |
| `rehydrate()` | Restores state from persisted storage |
| `subscribe(listener)` | Subscribes to state changes (returns unsubscribe) |
| `getSnapshot()` | Returns serializable state for `useSyncExternalStore` |

**Properties:**

| Property | Type | Description |
| --- | --- | --- |
| `ability` | `AccessAbility` | Underlying CASL MongoAbility |
| `user` | `AccessUser \| null` | Current user info |
| `roles` | `string[]` | Current role names |

### Adapters

Adapters bridge auth sources and the CASL-based policy. All adapters implement the `AccessAdapter` interface:

```ts
interface AccessAdapter {
  extract(authData: unknown): Promise<AccessExtractResult>;
}
```

**Built-in adapters:**

#### `createJwtAdapter`

Extracts permissions directly from JWT claims. No server round-trip required.

```ts
const adapter = createJwtAdapter({
  permissionFormat: "map",       // "map" | "flat" | "scopes"
  permissionsKey: "permissions", // JWT claim key
  rolesKey: "roles",
  userIdKey: "sub",
  usernameKey: "username",
  superAdminKey: "isSuperAdmin",
});
```

Permission formats:

| Format | JWT claim shape | Example |
| --- | --- | --- |
| `"map"` | `{ "Pet": ["list", "view"] }` | Spring Security `PermissionMap` |
| `"flat"` | `["PET:list", "PET:view"]` | Spring Security authorities |
| `"scopes"` | `"pet:read pet:write"` | OAuth2 scopes |

#### `createApiAdapter`

Fetches permissions from a REST endpoint.

```ts
const adapter = createApiAdapter({
  endpoint: "/api/v1/user/me/permissions",
  fetchFn: auth.fetchFn,  // Injects auth headers automatically
  transformResponse: (res) => ({
    permissions: (res as any).data.body.permissions,
    roles: (res as any).data.body.roles,
  }),
});
```

The default response format is `{ permissions: PermissionMap }`. Use `transformResponse` to handle custom server responses.

#### `createStaticAdapter`

Returns fixed rules. Useful for testing and defining public access.

```ts
const adapter = createStaticAdapter(
  [{ action: "view", subject: "Pet" }],
  { userId: "anon", username: "anonymous", roles: [] },
);
```

### Permission Normalization

Three helpers convert common permission formats into CASL rules:

```ts
// { Resource: [actions] } → CASL rules
normalizePermissionMap({ Pet: ["list", "view"] });
// → [{ action: "list", subject: "Pet" }, { action: "view", subject: "Pet" }]

// ["RESOURCE:action"] → CASL rules
normalizeFlatPermissions(["PET:list", "PET:view"]);
// → [{ action: "list", subject: "PET" }, { action: "view", subject: "PET" }]

// OAuth2 scopes → CASL rules
normalizeScopePermissions("pet:read pet:write");
// → [{ action: "read", subject: "pet" }, { action: "write", subject: "pet" }]
```

### Super-Admin Bypass

When a user is identified as a super-admin, the policy grants `manage:all` (all actions on all subjects).

Two detection methods:

```ts
// 1. AccessUser.isSuperAdmin flag (default)
const user: AccessUser = { userId: "1", username: "admin", roles: [], isSuperAdmin: true };

// 2. Custom checker function
const policy = createAccessPolicy({
  adapter,
  isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),
});
```

### Persistence

Persist access state to `localStorage` (or any `Storage`-compatible backend) for instant availability on page reload.

```ts
const policy = createAccessPolicy({
  adapter,
  persist: {
    storage: localStorage,  // Default
    key: "simplix-access",  // Default
  },
});

// Restore on app startup
const restored = policy.rehydrate(); // true if state was found
```

## React Bindings

### AccessProvider

Provides the policy to the component tree and optionally auto-syncs with auth.

```tsx
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";
import { AccessProvider } from "@simplix-react/access/react";

const policy = createAccessPolicy({
  adapter: createApiAdapter({ endpoint: "/api/v1/user/me/permissions" }),
  persist: { storage: localStorage },
});

function App() {
  return (
    <AccessProvider policy={policy} auth={auth}>
      <Router />
    </AccessProvider>
  );
}
```

**Auth auto-sync behavior:**

| Auth event | Policy action |
| --- | --- |
| Login (authenticated) | `policy.update(accessToken)` |
| Logout (unauthenticated) | `policy.clear()` then `policy.loadPublicAccess()` |
| Mount | `policy.rehydrate()` then initial sync |

The `auth` prop accepts any object implementing the `AuthLike` interface:

```ts
interface AuthLike {
  isAuthenticated(): boolean;
  getAccessToken(): string | null;
  subscribe(listener: () => void): () => void;
}
```

This avoids a hard dependency on `@simplix-react/auth`. Any auth implementation that satisfies this interface works.

### useCan

Returns a `boolean` for a single permission check. Reactively updates when the policy changes.

```tsx
function EditButton() {
  const canEdit = useCan("edit", "Pet");
  if (!canEdit) return null;
  return <button>Edit</button>;
}
```

**Opt-in behavior:** When there is no `AccessProvider` in the tree, `useCan` returns `true`. This allows gradual adoption — access control is applied only where you wire it up.

### useAccess

Returns the full `AccessPolicy` object. Throws if used outside an `AccessProvider`.

```tsx
function UserBadge() {
  const access = useAccess();
  return (
    <span>
      {access.user?.displayName} ({access.roles.join(", ")})
    </span>
  );
}
```

### Can

Declarative permission guard component.

```tsx
<Can I="edit" a="Pet">
  <EditButton />
</Can>

<Can I="delete" a="Pet" fallback={<span>No permission</span>}>
  <DeleteButton />
</Can>

{/* Invert: render when permission is ABSENT */}
<Can I="manage" a="all" not>
  <span>Limited access</span>
</Can>
```

| Prop | Type | Description |
| --- | --- | --- |
| `I` | `string` | Action to check |
| `a` | `string` | Subject to check |
| `not` | `boolean` | Invert the check |
| `fallback` | `ReactNode` | Rendered when check fails |
| `children` | `ReactNode` | Rendered when check passes |

### useMenuFilter

Recursively filters a menu tree based on permissions. Items without a `permission` field are always shown. If all children of a parent are filtered out, the parent is also removed.

```tsx
const menu = [
  { label: "Dashboard" },
  {
    label: "Management",
    children: [
      { label: "Pets", permission: { action: "list", subject: "Pet" } },
      { label: "Orders", permission: { action: "list", subject: "Order" } },
    ],
  },
];

function Sidebar() {
  const filtered = useMenuFilter(menu);
  return filtered.map((item) => <MenuItem key={item.label} {...item} />);
}
```

The `FilterableMenuItem` interface:

```ts
interface FilterableMenuItem {
  permission?: { action: string; subject: string };
  children?: FilterableMenuItem[];
  [key: string]: unknown;
}
```

### requireAccess (Route Guard)

Checks a permission synchronously. Throws `AccessDeniedError` on failure. Designed for TanStack Router `beforeLoad`.

```ts
import { requireAccess } from "@simplix-react/access/react";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    requireAccess(policy, {
      action: "view",
      subject: "BACKOFFICE_ACCESS",
    });
  },
});
```

**Handling the rehydration race condition:**

TanStack Router `beforeLoad` runs before React mounts, which means `AccessProvider` has not yet called `rehydrate()`. Use `storageFallback` to check persisted state directly:

```ts
requireAccess(policy, {
  action: "view",
  subject: "BACKOFFICE_ACCESS",
  storageFallback: {
    key: "simplix-access",
    check: (stored) => {
      const data = stored as { rules?: Array<{ action: string; subject: string }> };
      return data.rules?.some(
        (r) => r.action === "view" && r.subject === "BACKOFFICE_ACCESS",
      ) ?? false;
    },
  },
});
```

## Advanced Examples

### Spring Security JWT Integration

Spring Security backend returning permissions in JWT claims:

```ts
import { createAccessPolicy, createJwtAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createJwtAdapter({
    permissionFormat: "map",
    permissionsKey: "permissions",  // { "PET": ["list", "view"], "ORDER": ["list"] }
    rolesKey: "roles",              // ["ROLE_ADMIN", "ROLE_USER"]
    superAdminKey: "isSuperAdmin",
  }),
  isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),
  persist: { storage: localStorage },
});
```

### Spring Security REST API Integration

Fetching permissions from a dedicated endpoint:

```ts
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createApiAdapter({
    endpoint: "/api/v1/user/me/permissions",
    fetchFn: auth.fetchFn,
    transformResponse: (res) => {
      const data = res as {
        permissions: Record<string, string[]>;
        roles: string[];
        isSuperAdmin: boolean;
      };
      return {
        permissions: data.permissions,
        roles: data.roles,
        isSuperAdmin: data.isSuperAdmin,
      };
    },
  }),
  persist: { storage: localStorage },
});
```

### Public Access Rules

Allow unauthenticated users to access specific resources:

```ts
// Static public rules
const policy = createAccessPolicy({
  adapter,
  publicAccess: [
    { action: "list", subject: "Pet" },
    { action: "view", subject: "Pet" },
  ],
});

// Or fetch from server
const policy = createAccessPolicy({
  adapter,
  publicAccess: createApiAdapter({
    endpoint: "/api/v1/public/user/permissions",
  }),
});

// Load on app init (before login)
await policy.loadPublicAccess();
```

### Full Provider Setup with Auth Sync

```tsx
import { createAuth, bearerScheme } from "@simplix-react/auth";
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";
import { AccessProvider } from "@simplix-react/access/react";

const auth = createAuth({
  scheme: bearerScheme({ loginPath: "/api/auth/login" }),
});

const policy = createAccessPolicy({
  adapter: createApiAdapter({
    endpoint: "/api/v1/user/me/permissions",
    fetchFn: auth.fetchFn,
  }),
  publicAccess: createApiAdapter({
    endpoint: "/api/v1/public/user/permissions",
  }),
  isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),
  persist: { storage: localStorage },
});

function App() {
  return (
    <AuthProvider auth={auth}>
      <AccessProvider policy={policy} auth={auth}>
        <Router />
      </AccessProvider>
    </AuthProvider>
  );
}
```

### Custom Adapter

Implement `AccessAdapter` for any auth source:

```ts
import type { AccessAdapter, AccessExtractResult } from "@simplix-react/access";

const customAdapter: AccessAdapter = {
  async extract(authData: unknown): Promise<AccessExtractResult> {
    const session = authData as { token: string };
    const res = await fetch("/api/permissions", {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const data = await res.json();

    return {
      rules: data.permissions.map((p: any) => ({
        action: p.action,
        subject: p.resource,
      })),
      user: {
        userId: data.user.id,
        username: data.user.name,
        roles: data.user.roles,
      },
      roles: data.user.roles,
    };
  },
};
```

### Role Checking

Role utilities normalize the `ROLE_` prefix automatically:

```ts
policy.hasRole("ADMIN");        // checks against "ROLE_ADMIN"
policy.hasRole("ROLE_ADMIN");   // same check

policy.hasAnyRole(["ADMIN", "MANAGER"]); // true if user has either
```

### Type-Safe Permissions

Narrow action and subject types with generics:

```ts
type MyActions = "list" | "view" | "create" | "edit" | "delete";
type MySubjects = "Pet" | "Order" | "User";

const policy = createAccessPolicy<MyActions, MySubjects>({
  adapter: createJwtAdapter(),
});

policy.can("view", "Pet");       // OK
policy.can("view", "all");       // OK (wildcard always allowed)
// policy.can("fly", "Pet");     // Type error: "fly" is not in MyActions
// policy.can("view", "Rocket"); // Type error: "Rocket" is not in MySubjects
```

## Error Handling

### AccessDeniedError

Thrown by `requireAccess` when a permission check fails.

```ts
import { AccessDeniedError } from "@simplix-react/access";

try {
  requireAccess(policy, { action: "delete", subject: "Pet" });
} catch (error) {
  if (error instanceof AccessDeniedError) {
    console.log(error.action);  // "delete"
    console.log(error.subject); // "Pet"
    console.log(error.message); // 'Access denied: cannot "delete" on "Pet"'
  }
}
```

In TanStack Router, catch this in a route's `onError` or a global error boundary to redirect unauthorized users.

## Testing

Use `@simplix-react/testing` utilities:

```tsx
import { createMockPolicy } from "@simplix-react/testing";
import { createAccessTestWrapper } from "@simplix-react/testing";

// Default: allows everything (manage:all)
const policy = createMockPolicy();

// Restrict to specific rules
const policy = createMockPolicy({
  allowAll: false,
  rules: [{ action: "view", subject: "Pet" }],
  user: { userId: "1", username: "test", roles: ["ROLE_USER"] },
});

// Wrap components for testing
const wrapper = createAccessTestWrapper({ policy });
render(<MyComponent />, { wrapper });
```

## Related Packages

| Package | Relationship |
| --- | --- |
| `@simplix-react/auth` | Optional. Provides `AuthLike` for auto-sync. |
| `@simplix-react/testing` | Provides `createMockPolicy` and `createAccessTestWrapper`. |
| `@casl/ability` | Required peer. Powers permission evaluation engine. |
