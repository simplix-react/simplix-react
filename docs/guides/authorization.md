# How to Add Authorization

> Set up role-based access control using `@simplix-react/access` with CASL-powered permission checks, adapter-based rule extraction, and React integration.

## Before You Begin

- You have a running simplix-react application with authentication set up
- Install the access package and its peer dependency:

```bash
pnpm add @simplix-react/access @casl/ability
```

- Familiarity with the concept of actions (verbs like `view`, `edit`) and subjects (resource names like `Pet`, `Order`)

## Solution

### Step 1 -- Create an AccessPolicy with an Adapter

The `createAccessPolicy` function creates a policy instance backed by CASL. You choose an adapter based on where your permission data lives.

**JWT Adapter** -- Extract permissions directly from JWT claims (no server round-trip):

```ts
import { createAccessPolicy, createJwtAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createJwtAdapter({
    permissionFormat: "map",
    permissionsKey: "permissions",
    rolesKey: "roles",
    userIdKey: "sub",
    usernameKey: "username",
    superAdminKey: "isSuperAdmin",
  }),
  persist: { storage: localStorage },
});
```

The JWT adapter supports three permission formats:

| Format | JWT claim shape | Example |
| --- | --- | --- |
| `"map"` | `{ "Pet": ["list", "view"] }` | Spring Security `PermissionMap` |
| `"flat"` | `["PET:list", "PET:view"]` | Spring Security authorities |
| `"scopes"` | `"pet:read pet:write"` | OAuth2 scopes |

For the `"flat"` format, configure a separator (defaults to `":"`):

```ts
const adapter = createJwtAdapter({
  permissionFormat: "flat",
  flatSeparator: ":",
  rolesKey: "authorities",
});
```

For a fully custom JWT structure, use the `transform` option to bypass default extraction:

```ts
const adapter = createJwtAdapter({
  transform: (claims) => ({
    rules: Object.entries(claims.perms as Record<string, string[]>).flatMap(
      ([subject, actions]) =>
        actions.map((action) => ({ action, subject })),
    ),
    user: {
      userId: String(claims.sub),
      username: String(claims.name),
      roles: claims.roles as string[],
    },
    roles: claims.roles as string[],
  }),
});
```

**API Adapter** -- Fetch permissions from a REST endpoint:

```ts
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createApiAdapter({
    endpoint: "/api/v1/user/me/permissions",
    fetchFn: auth.fetchFn, // injects auth headers automatically
  }),
  persist: { storage: localStorage },
});
```

The default response format is `{ permissions: PermissionMap }`. For custom server responses, use `transformResponse`:

```ts
const adapter = createApiAdapter({
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
});
```

**Static Adapter** -- Return fixed rules (useful for testing and development):

```ts
import { createAccessPolicy, createStaticAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createStaticAdapter(
    [
      { action: "list", subject: "Pet" },
      { action: "view", subject: "Pet" },
      { action: "create", subject: "Pet" },
    ],
    { userId: "test-user", username: "tester", roles: ["ROLE_USER"] },
  ),
});

// Load the static rules
await policy.update(null);

policy.can("view", "Pet");    // true
policy.can("delete", "Pet");  // false
```

### Step 2 -- Configure Super-Admin Bypass and Persistence

A super-admin user bypasses all permission checks by receiving `manage:all` (all actions on all subjects).

Two detection methods:

```ts
const policy = createAccessPolicy({
  adapter,

  // Option 1: Custom checker function
  isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),

  // Persistence: restore state across page reloads
  persist: {
    storage: localStorage,  // default
    key: "simplix-access",  // default
  },
});
```

The `AccessUser.isSuperAdmin` flag is the default detection method. If the JWT or API response sets `isSuperAdmin: true`, the user is automatically treated as a super-admin.

### Step 3 -- Set Up AccessProvider in React

Wrap your app with `AccessProvider` to make the policy available to all components. Pass an optional `auth` prop to auto-sync with authentication state.

```tsx
import { createAuth, bearerScheme, localStorageStore } from "@simplix-react/auth";
import { AuthProvider } from "@simplix-react/auth/react";
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";
import { AccessProvider } from "@simplix-react/access/react";

// Auth setup
const store = localStorageStore("myapp:");
const auth = createAuth({
  schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
  store,
});

// Access policy setup
const policy = createAccessPolicy({
  adapter: createApiAdapter({
    endpoint: "/api/v1/user/me/permissions",
    fetchFn: auth.fetchFn,
  }),
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

Auto-sync behavior:

| Auth event | Policy action |
| --- | --- |
| Login (authenticated) | `policy.update(accessToken)` |
| Logout (unauthenticated) | `policy.clear()` then `policy.loadPublicAccess()` |
| Mount | `policy.rehydrate()` then initial sync |

The `auth` prop accepts any object implementing `AuthLike`:

```ts
interface AuthLike {
  isAuthenticated(): boolean;
  getAccessToken(): string | null;
  subscribe(listener: () => void): () => void;
}
```

### Step 4 -- Check Permissions with useCan and Can

**`useCan` hook** -- Returns a boolean for a single permission check:

```tsx
import { useCan } from "@simplix-react/access/react";

function PetToolbar() {
  const canCreate = useCan("create", "Pet");
  const canExport = useCan("export", "Pet");

  return (
    <div>
      {canCreate && <button>Add Pet</button>}
      {canExport && <button>Export CSV</button>}
    </div>
  );
}
```

When there is no `AccessProvider` in the tree, `useCan` returns `true`. This enables opt-in adoption -- access control is applied only where you wire it up.

**`Can` component** -- Declarative permission guard:

```tsx
import { Can } from "@simplix-react/access/react";

function PetActions() {
  return (
    <div>
      <Can I="edit" a="Pet">
        <button>Edit</button>
      </Can>

      <Can I="delete" a="Pet" fallback={<span>No permission</span>}>
        <button>Delete</button>
      </Can>

      {/* Invert: render when permission is ABSENT */}
      <Can I="manage" a="all" not>
        <span>Limited access mode</span>
      </Can>
    </div>
  );
}
```

`Can` component props:

| Prop | Type | Description |
| --- | --- | --- |
| `I` | `string` | Action to check |
| `a` | `string` | Subject to check |
| `not` | `boolean` | Invert the check |
| `fallback` | `ReactNode` | Rendered when check fails |
| `children` | `ReactNode` | Rendered when check passes |

### Step 5 -- Access the Full Policy with useAccess

When you need more than a single permission check (e.g., user info, roles), use `useAccess`:

```tsx
import { useAccess } from "@simplix-react/access/react";

function UserBadge() {
  const access = useAccess();

  return (
    <span>
      {access.user?.displayName} ({access.roles.join(", ")})
    </span>
  );
}
```

Unlike `useCan`, `useAccess` throws if used outside an `AccessProvider`.

### Step 6 -- Protect Routes with requireAccess

Use `requireAccess` in TanStack Router `beforeLoad` guards. It throws `AccessDeniedError` when the check fails.

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

Handle the error in a route's `onError` or a global error boundary:

```ts
import { AccessDeniedError } from "@simplix-react/access";

// In TanStack Router error handler
if (error instanceof AccessDeniedError) {
  console.log(error.action);  // "view"
  console.log(error.subject); // "BACKOFFICE_ACCESS"
  console.log(error.message); // 'Access denied: cannot "view" on "BACKOFFICE_ACCESS"'
  navigate({ to: "/unauthorized" });
}
```

### Step 7 -- Filter Menus with useMenuFilter

`useMenuFilter` recursively filters a menu tree based on the current user's permissions. Items without a `permission` field are always shown. If all children of a parent are filtered out, the parent is also removed.

```tsx
import { useMenuFilter } from "@simplix-react/access/react";
import type { FilterableMenuItem } from "@simplix-react/access/react";

const menu: FilterableMenuItem[] = [
  { label: "Dashboard" },
  {
    label: "Management",
    children: [
      { label: "Pets", permission: { action: "list", subject: "Pet" } },
      { label: "Orders", permission: { action: "list", subject: "Order" } },
      { label: "Users", permission: { action: "list", subject: "User" } },
    ],
  },
  { label: "Settings", permission: { action: "view", subject: "Settings" } },
];

function Sidebar() {
  const filtered = useMenuFilter(menu);

  return (
    <nav>
      {filtered.map((item) => (
        <MenuItem key={item.label} {...item} />
      ))}
    </nav>
  );
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

When used outside an `AccessProvider`, all items are returned unfiltered.

## Variations

### Role Checking

Role utilities normalize the `ROLE_` prefix automatically -- `"ADMIN"` matches `"ROLE_ADMIN"`:

```ts
// On the policy instance
policy.hasRole("ADMIN");                     // checks against "ROLE_ADMIN"
policy.hasRole("ROLE_ADMIN");                // same check

policy.hasAnyRole(["ADMIN", "MANAGER"]);     // true if user has either

// Standalone helpers
import { hasRole, hasAnyRole, normalizeRole } from "@simplix-react/access";

normalizeRole("ADMIN");                      // "ROLE_ADMIN"
normalizeRole("ROLE_ADMIN");                 // "ROLE_ADMIN"

hasRole(["ROLE_ADMIN", "ROLE_USER"], "ADMIN");         // true
hasAnyRole(["ROLE_USER"], ["ADMIN", "USER"]);          // true
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

### Directly Setting Rules (Without an Adapter)

Use `setRules` to apply rules programmatically without going through an adapter:

```ts
policy.setRules(
  [
    { action: "view", subject: "Pet" },
    { action: "edit", subject: "Pet" },
  ],
  { userId: "1", username: "john", roles: ["ROLE_EDITOR"] },
  ["ROLE_EDITOR"],
);
```

### Subscribing to Access Changes (Non-React)

```ts
const unsubscribe = policy.subscribe(() => {
  console.log("Access state changed");
  console.log("User:", policy.user);
  console.log("Roles:", policy.roles);
});

// Clean up when done
unsubscribe();
```

### Testing

Use `createStaticAdapter` or `@simplix-react/testing` utilities:

```tsx
import { createMockPolicy, createAccessTestWrapper } from "@simplix-react/testing";

// Default: allows everything (manage:all)
const policy = createMockPolicy();

// Restricted rules
const policy = createMockPolicy({
  allowAll: false,
  rules: [{ action: "view", subject: "Pet" }],
  user: { userId: "1", username: "test", roles: ["ROLE_USER"] },
});

// Wrap components for testing
const wrapper = createAccessTestWrapper({ policy });
render(<MyComponent />, { wrapper });
```

## Related

- [Authentication Guide](./authentication.md) -- Set up authenticated API requests
- [@simplix-react/access API Reference](../api/@simplix-react/access/README.md) -- Full API documentation
- [Testing with Mocks](./testing-with-mocks.md) -- Testing components with mock data
