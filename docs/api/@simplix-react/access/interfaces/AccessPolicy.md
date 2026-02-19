[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessPolicy

# Interface: AccessPolicy\<TActions, TSubjects\>

Defined in: [packages/access/src/types.ts:313](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L313)

The main access policy interface.

## Remarks

Wraps a CASL ability instance with user/role management,
persistence, and a subscription model for React integration.
Created via [createAccessPolicy](../functions/createAccessPolicy.md).

## Example

```ts
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";

const policy = createAccessPolicy({
  adapter: createApiAdapter({ endpoint: "/api/v1/permissions" }),
});

await policy.update(null);
policy.can("view", "Pet");    // true
policy.hasRole("ADMIN");      // true
```

## See

[createAccessPolicy](../functions/createAccessPolicy.md) to create an instance.

## Type Parameters

### TActions

`TActions` *extends* `string` = [`DefaultActions`](../type-aliases/DefaultActions.md)

Action verb union (defaults to [DefaultActions](../type-aliases/DefaultActions.md)).

### TSubjects

`TSubjects` *extends* `string` = [`DefaultSubjects`](../type-aliases/DefaultSubjects.md)

Subject name union (defaults to any `string`).

## Properties

### ability

> `readonly` **ability**: [`AccessAbility`](../type-aliases/AccessAbility.md)\<`TActions`, `TSubjects`\>

Defined in: [packages/access/src/types.ts:318](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L318)

The underlying CASL ability instance.

***

### roles

> `readonly` **roles**: `string`[]

Defined in: [packages/access/src/types.ts:322](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L322)

The current role names.

***

### user

> `readonly` **user**: [`AccessUser`](AccessUser.md)\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [packages/access/src/types.ts:320](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L320)

The current authenticated user, or `null`.

## Methods

### can()

> **can**(`action`, `subject`): `boolean`

Defined in: [packages/access/src/types.ts:331](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L331)

Returns `true` if the given action is allowed on the subject.

#### Parameters

##### action

`TActions`

The action to check (e.g., `"view"`, `"edit"`).

##### subject

The subject to check against (e.g., `"Pet"`, `"all"`).

`"all"` | `TSubjects`

#### Returns

`boolean`

`true` if allowed.

***

### cannot()

> **cannot**(`action`, `subject`): `boolean`

Defined in: [packages/access/src/types.ts:340](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L340)

Returns `true` if the given action is NOT allowed on the subject.

#### Parameters

##### action

`TActions`

The action to check.

##### subject

The subject to check against.

`"all"` | `TSubjects`

#### Returns

`boolean`

`true` if denied.

***

### clear()

> **clear**(): `void`

Defined in: [packages/access/src/types.ts:385](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L385)

Clears all access state and persisted data.

#### Returns

`void`

***

### getSnapshot()

> **getSnapshot**(): [`AccessSnapshot`](AccessSnapshot.md)\<`TActions`, `TSubjects`\>

Defined in: [packages/access/src/types.ts:420](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L420)

Returns a serializable snapshot of the current state.

#### Returns

[`AccessSnapshot`](AccessSnapshot.md)\<`TActions`, `TSubjects`\>

The current [AccessSnapshot](AccessSnapshot.md).

#### Remarks

The snapshot reference is stable between state changes, making it
safe for use with `useSyncExternalStore`.

***

### hasAnyRole()

> **hasAnyRole**(`roles`): `boolean`

Defined in: [packages/access/src/types.ts:359](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L359)

Checks if the current user has any of the given roles.

#### Parameters

##### roles

`string`[]

Role names to check (with or without `ROLE_` prefix).

#### Returns

`boolean`

`true` if the user has at least one of the roles.

***

### hasRole()

> **hasRole**(`role`): `boolean`

Defined in: [packages/access/src/types.ts:351](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L351)

Checks if the current user has the given role.

#### Parameters

##### role

`string`

The role to check (with or without `ROLE_` prefix).

#### Returns

`boolean`

`true` if the user has the role.

#### Remarks

Role matching is prefix-insensitive: `"ADMIN"` matches `"ROLE_ADMIN"`.

***

### loadPublicAccess()

> **loadPublicAccess**(): `Promise`\<`void`\>

Defined in: [packages/access/src/types.ts:394](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L394)

Loads public (unauthenticated) access rules from the config.

#### Returns

`Promise`\<`void`\>

#### Remarks

Uses the `publicAccess` value from [AccessPolicyConfig](AccessPolicyConfig.md).
Does nothing if `publicAccess` is not configured.

***

### rehydrate()

> **rehydrate**(): `boolean`

Defined in: [packages/access/src/types.ts:401](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L401)

Attempts to rehydrate access state from persisted storage.

#### Returns

`boolean`

`true` if state was successfully restored, `false` otherwise.

***

### setRules()

> **setRules**(`rules`, `user?`, `roles?`): `void`

Defined in: [packages/access/src/types.ts:378](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L378)

Directly sets rules, user, and roles without going through the adapter.

#### Parameters

##### rules

`DefineRule`\<`ToAbilityTypes`\<\[`TActions`, `"all"` \| `TSubjects`\]\>, `MongoQuery`, `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<\[`TActions`, `"all"` \| `TSubjects`\]\>, `string`\>\>\>[]

CASL rules to apply.

##### user?

[`AccessUser`](AccessUser.md)\<`Record`\<`string`, `unknown`\>\>

User info to set (keeps current if omitted).

##### roles?

`string`[]

Role names to set (keeps current if omitted).

#### Returns

`void`

#### Remarks

Omitted `user` and `roles` parameters preserve their current values.

***

### subscribe()

> **subscribe**(`listener`): () => `void`

Defined in: [packages/access/src/types.ts:409](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L409)

Subscribes to access state changes.

#### Parameters

##### listener

() => `void`

Callback invoked when rules, user, or roles change.

#### Returns

An unsubscribe function.

> (): `void`

##### Returns

`void`

***

### update()

> **update**(`authData`): `Promise`\<`void`\>

Defined in: [packages/access/src/types.ts:366](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L366)

Updates access state by extracting rules from the given auth data.

#### Parameters

##### authData

`unknown`

Raw auth data passed to the adapter (e.g., JWT string).

#### Returns

`Promise`\<`void`\>
