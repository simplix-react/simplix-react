# Authorization

## Overview

Authorization in simplix-react is handled by `@simplix-react/access`, a package that wraps the CASL library to provide declarative, rule-based access control. Rather than scattering permission checks throughout your application, you declare an `AccessPolicy` once --- backed by an adapter that extracts rules from your authentication source --- and the policy becomes the single source of truth for what the current user can and cannot do.

The core insight is that authorization rules almost always come from an external source (a JWT token, an API endpoint, a static configuration) and need to be translated into a uniform format that the frontend can evaluate. The access package formalizes this translation through the adapter pattern: each adapter knows how to extract CASL rules from a specific auth source, and the policy evaluates those rules consistently regardless of where they came from.

This separation means the same application code works with different authorization backends --- JWT claims in one environment, an API endpoint in another, static rules in tests --- without any changes to the permission-checking logic.

## How It Works

### The CASL Foundation

CASL is a JavaScript library for isomorphic authorization. It models permissions as a list of rules, where each rule pairs an **action** (what the user wants to do) with a **subject** (the resource they want to act on):

```ts
{ action: "view", subject: "Pet" }
{ action: "edit", subject: "Order" }
{ action: "manage", subject: "all" }  // wildcard: all actions on all subjects
```

`@simplix-react/access` wraps CASL's `MongoAbility` type as `AccessAbility` and its raw rules as `AccessRule`. The `DefaultActions` type provides a standard set of action verbs:

| Action | Purpose |
| --- | --- |
| `list` | View a collection |
| `view` | View a single record |
| `create` | Create a new record |
| `edit` | Modify an existing record |
| `delete` | Remove a record |
| `export` | Export data |
| `import` | Import data |
| `approve` | Approve a workflow step |
| `manage` | Wildcard: all actions |

Both `TActions` and `TSubjects` are generic parameters that can be narrowed to application-specific unions for stricter type safety, or left as `string` for flexibility.

### AccessPolicy Creation and Lifecycle

The `createAccessPolicy` function creates the central policy instance:

```ts
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createApiAdapter({ endpoint: "/api/v1/permissions" }),
  isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),
  persist: { storage: localStorage },
});
```

The policy starts empty --- no user, no roles, no rules. Its lifecycle is:

```
empty → update(authData) → adapter.extract(authData) → applyRules → active
                                                                       |
                                                            subscribe/notify
                                                                       |
active → clear() → empty (persisted state also cleared)
```

Key methods on the policy:

| Method | Purpose |
| --- | --- |
| `update(authData)` | Passes auth data to the adapter, applies extracted rules |
| `setRules(rules, user?, roles?)` | Directly sets rules without going through the adapter |
| `can(action, subject)` | Returns `true` if the action is allowed |
| `cannot(action, subject)` | Returns `true` if the action is denied |
| `hasRole(role)` | Checks if the user has a role (prefix-insensitive) |
| `hasAnyRole(roles)` | Checks if the user has any of the given roles |
| `clear()` | Clears all state and persisted data |
| `loadPublicAccess()` | Loads unauthenticated access rules from config |
| `rehydrate()` | Restores state from persisted storage |
| `subscribe(listener)` | Subscribes to state changes (for React integration) |
| `getSnapshot()` | Returns a reference-stable snapshot for `useSyncExternalStore` |

### The Adapter Pattern

Adapters bridge the gap between authentication data sources and CASL rules. Every adapter implements the `AccessAdapter` interface:

```ts
interface AccessAdapter<TActions, TSubjects> {
  extract(authData: unknown): Promise<AccessExtractResult<TActions, TSubjects>>;
}
```

The `extract` method receives raw auth data and returns rules, user info, and roles. Three built-in adapters cover the most common scenarios:

```
AccessAdapter (interface)
    |
    +--- createJwtAdapter()     → Decodes JWT payload, extracts permissions
    |
    +--- createApiAdapter()     → Fetches rules from an API endpoint
    |
    +--- createStaticAdapter()  → Returns fixed rules (testing, public access)
```

**JWT Adapter** (`createJwtAdapter`): Decodes a JWT token client-side (without signature verification) and converts claims into CASL rules. Supports three permission formats:

| Format | Shape | Example |
| --- | --- | --- |
| `"map"` | `{ Resource: [actions] }` | `{ Pet: ["list", "view"] }` |
| `"flat"` | `["RESOURCE:action"]` | `["PET:list", "PET:view"]` |
| `"scopes"` | Space-delimited string | `"pet:read pet:write"` |

Configurable claim keys (`rolesKey`, `permissionsKey`, `userIdKey`, etc.) make it compatible with Spring Security, Keycloak, Auth0, and custom JWT structures. A `transform` function provides a complete escape hatch for non-standard token layouts.

**API Adapter** (`createApiAdapter`): Fetches permissions from a server endpoint. The default response format is `{ permissions: PermissionMap }`, with automatic handling of nested `{ body: { permissions } }` structures. Accepts a custom `fetchFn` (typically the authenticated fetch from `@simplix-react/auth`) and a `transformResponse` function for non-standard response shapes.

**Static Adapter** (`createStaticAdapter`): Returns the same fixed rules on every `extract` call. Useful for testing, development, and defining public access rules via the `publicAccess` config option.

### Rule Normalization

Backend systems represent permissions in different formats. The normalization helpers convert these into uniform CASL rules:

| Helper | Input | Output |
| --- | --- | --- |
| `normalizePermissionMap` | `{ Pet: ["list", "view"] }` | `[{ action: "list", subject: "Pet" }, ...]` |
| `normalizeFlatPermissions` | `["PET:list", "PET:view"]` | `[{ action: "list", subject: "PET" }, ...]` |
| `normalizeScopePermissions` | `"pet:read pet:write"` | `[{ action: "read", subject: "pet" }, ...]` |

For flat permissions without a separator (e.g., `"ROLE_ADMIN"`), the string is treated as a subject with `"manage"` action.

### Role Utilities

Roles are normalized to handle the common `ROLE_` prefix convention used by Spring Security:

| Helper | Behavior |
| --- | --- |
| `normalizeRole(role)` | Ensures `ROLE_` prefix: `"ADMIN"` becomes `"ROLE_ADMIN"` |
| `normalizeRoles(roles)` | Normalizes mixed arrays of strings and role objects |
| `hasRole(roles, role)` | Prefix-insensitive comparison |
| `hasAnyRole(roles, targetRoles)` | Returns `true` if any target role matches |

The `RoleInput` type accepts both plain strings and Spring Security role objects (`{ roleCode, roleName, name }`), making it compatible with various backend role representations.

### Super-Admin Bypass

When a user is identified as a super-admin, the policy replaces all extracted rules with a single wildcard rule:

```ts
[{ action: "manage", subject: "all" }]
```

This grants unrestricted access to every resource. The check uses either a custom `isSuperAdmin` function from the policy config or the `user.isSuperAdmin` flag from the `AccessUser` object.

### Persistence and Rehydration

When `persist` is configured, the policy serializes its state (rules, user, roles) to a `Storage` backend (defaults to `localStorage`) under a configurable key (defaults to `"simplix-access"`).

On application startup, `rehydrate()` restores the persisted state, allowing the policy to be functional immediately --- before the auth adapter has fetched fresh rules. This prevents a flash of unauthorized content during page load.

### Subscription Model

The policy implements a `subscribe`/`getSnapshot` pattern compatible with React's `useSyncExternalStore`. The snapshot reference (`AccessSnapshot`) is only updated when state actually changes, preventing infinite re-render loops.

```
policy.subscribe(listener) → listener called on every state change
policy.getSnapshot()        → returns cached AccessSnapshot (reference-stable)
```

### React Integration

React bindings are provided via a separate entry point (`@simplix-react/access/react`):

**AccessProvider**: Wraps the component tree with the policy context. Optionally accepts an `AuthLike` instance (compatible with `@simplix-react/auth`) for automatic synchronization --- when the user logs in, the policy is updated with the access token; when the user logs out, the policy is cleared and public access rules are loaded.

```tsx
<AccessProvider policy={policy} auth={auth}>
  <App />
</AccessProvider>
```

**useCan(action, subject)**: Returns a reactive boolean. When used outside an `AccessProvider`, always returns `true` to support opt-in access control.

```tsx
const canEdit = useCan("edit", "Pet");
```

**useAccess()**: Returns the full `AccessPolicy` object. Throws if used outside an `AccessProvider`.

```tsx
const access = useAccess();
access.user?.displayName;
access.hasRole("ADMIN");
```

**Can component**: Declarative access guard with `I` (action), `a` (subject), optional `not` inversion, and `fallback` content:

```tsx
<Can I="edit" a="Pet" fallback={<span>Read only</span>}>
  <EditButton />
</Can>
```

**requireAccess(policy, options)**: Imperative guard for route-level protection, designed for TanStack Router `beforeLoad`. Throws `AccessDeniedError` when the check fails. Supports a `storageFallback` option for checking persisted state when the policy has not yet rehydrated.

```ts
requireAccess(policy, { action: "view", subject: "BACKOFFICE_ACCESS" });
```

**useMenuFilter(items)**: Recursively filters a menu tree based on each item's `permission` property. Items without a `permission` are always shown. If all children of a parent are filtered out, the parent is removed too.

```tsx
const filtered = useMenuFilter(menuItems);
```

## Design Decisions

### Why CASL?

CASL was chosen because it provides a well-tested, isomorphic authorization model with a clean rule format. Its `MongoAbility` supports both simple action/subject checks and more advanced features (conditions, field-level permissions) that applications can grow into. The rule format (`{ action, subject }`) maps naturally to both REST endpoints and UI permission checks.

Alternatives considered:

- **Custom permission maps** --- simpler but lack the composability and condition support that CASL provides
- **Role-only checks** --- insufficient for fine-grained resource-level permissions
- **Server-side only** --- adds latency to every UI interaction and requires network connectivity

### Why the Adapter Pattern?

Authorization data arrives in many formats: JWT claims, API responses, static configs, SSO providers. The adapter pattern decouples rule extraction from rule evaluation, allowing the same policy instance to work with different auth backends without any changes to application code.

### Why Opt-In Access Control?

`useCan` returns `true` when used outside an `AccessProvider`. This makes access control opt-in --- applications can add authorization incrementally without wrapping every component tree in a provider. Components that use `useCan` work in both access-controlled and uncontrolled contexts.

### Why Separate from Auth?

The access package depends on `@simplix-react/auth` only through the minimal `AuthLike` interface (three methods: `isAuthenticated`, `getAccessToken`, `subscribe`). This avoids a hard dependency and allows the access package to work with any auth implementation that satisfies the interface.

## Implications

### For Application Developers

- Authorization is declared once via `createAccessPolicy` and injected via `AccessProvider`
- Permission checks in components use `useCan` (reactive) or `Can` (declarative)
- Route-level protection uses `requireAccess` in router guards
- Menu filtering is automatic via `useMenuFilter`
- Switching auth backends (JWT to API) requires changing only the adapter, not the permission-checking code

### For Testing

- Use `createStaticAdapter` with fixed rules to test permission-dependent UI
- The policy's `setRules` method allows direct state manipulation in tests
- `useCan` returning `true` outside a provider means components render correctly without access setup

## Related

- [Authentication](./authentication.md) --- how auth tokens are managed and refreshed
- [API Contracts](./api-contracts.md) --- how contracts define the entity surface that access controls protect
