[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / createAccessPolicy

# Function: createAccessPolicy()

> **createAccessPolicy**\<`TActions`, `TSubjects`\>(`config`): [`AccessPolicy`](../interfaces/AccessPolicy.md)\<`TActions`, `TSubjects`\>

Defined in: [packages/access/src/create-access-policy.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/create-access-policy.ts#L56)

Creates an [AccessPolicy](../interfaces/AccessPolicy.md) instance backed by CASL.

## Type Parameters

### TActions

`TActions` *extends* `string` = `string`

Action verb union (defaults to [DefaultActions](../type-aliases/DefaultActions.md)).

### TSubjects

`TSubjects` *extends* `string` = `string`

Subject name union (defaults to any `string`).

## Parameters

### config

[`AccessPolicyConfig`](../interfaces/AccessPolicyConfig.md)\<`TActions`, `TSubjects`\>

Policy configuration including adapter, persistence, and super-admin settings.

## Returns

[`AccessPolicy`](../interfaces/AccessPolicy.md)\<`TActions`, `TSubjects`\>

A fully initialized [AccessPolicy](../interfaces/AccessPolicy.md) with empty state.

## Remarks

The policy manages a CASL ability, user info, and roles.
It supports adapter-based rule extraction, persistence,
super-admin bypass, and a subscription model for React integration.

The returned policy exposes a stable `getSnapshot()` reference
for use with `useSyncExternalStore`, preventing infinite re-render loops.

## Example

```ts
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createApiAdapter({ endpoint: "/api/v1/permissions" }),
  isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),
  persist: { storage: localStorage },
});

await policy.update(jwtToken);
policy.can("view", "Pet"); // true or false
```

## See

 - [AccessPolicyConfig](../interfaces/AccessPolicyConfig.md) for configuration options.
 - [AccessPolicy](../interfaces/AccessPolicy.md) for the returned interface.
