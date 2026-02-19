[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessPolicyConfig

# Interface: AccessPolicyConfig\<TActions, TSubjects\>

Defined in: [packages/access/src/types.ts:240](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/types.ts#L240)

Configuration for creating an [AccessPolicy](AccessPolicy.md).

## Example

```ts
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";

const config: AccessPolicyConfig = {
  adapter: createApiAdapter({ endpoint: "/api/v1/permissions" }),
  isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),
  persist: { storage: localStorage },
};
const policy = createAccessPolicy(config);
```

## See

[createAccessPolicy](../functions/createAccessPolicy.md)

## Type Parameters

### TActions

`TActions` *extends* `string` = [`DefaultActions`](../type-aliases/DefaultActions.md)

Action verb union (defaults to [DefaultActions](../type-aliases/DefaultActions.md)).

### TSubjects

`TSubjects` *extends* `string` = [`DefaultSubjects`](../type-aliases/DefaultSubjects.md)

Subject name union (defaults to any `string`).

## Properties

### adapter

> **adapter**: [`AccessAdapter`](AccessAdapter.md)\<`TActions`, `TSubjects`\>

Defined in: [packages/access/src/types.ts:245](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/types.ts#L245)

Adapter that extracts rules from auth data.

***

### isSuperAdmin()?

> `optional` **isSuperAdmin**: (`user`) => `boolean`

Defined in: [packages/access/src/types.ts:254](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/types.ts#L254)

Custom super-admin check. Defaults to checking `user.isSuperAdmin`.

#### Parameters

##### user

[`AccessUser`](AccessUser.md)

#### Returns

`boolean`

***

### onAccessDenied()?

> `optional` **onAccessDenied**: (`action`, `subject`) => `void`

Defined in: [packages/access/src/types.ts:256](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/types.ts#L256)

Callback invoked when an access check fails.

#### Parameters

##### action

`string`

##### subject

`string`

#### Returns

`void`

***

### persist?

> `optional` **persist**: [`AccessPersistConfig`](AccessPersistConfig.md)

Defined in: [packages/access/src/types.ts:258](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/types.ts#L258)

Persistence configuration.

***

### publicAccess?

> `optional` **publicAccess**: [`AccessAdapter`](AccessAdapter.md)\<`TActions`, `TSubjects`\> \| `DefineRule`\<`ToAbilityTypes`\<\[`TActions`, `"all"` \| `TSubjects`\]\>, `MongoQuery`, `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<\[`TActions`, `"all"` \| `TSubjects`\]\>, `string`\>\>\>[]

Defined in: [packages/access/src/types.ts:250](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/types.ts#L250)

Rules or adapter for unauthenticated (public) access.
If an array, used as static rules. If an adapter, called with `null`.
