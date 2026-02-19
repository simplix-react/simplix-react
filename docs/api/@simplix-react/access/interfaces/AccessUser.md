[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessUser

# Interface: AccessUser\<TMeta\>

Defined in: packages/access/src/types.ts:108

Represents an authenticated user for access control purposes.

## Example

```ts
const user: AccessUser = {
  userId: "user-1",
  username: "john",
  roles: ["ROLE_ADMIN"],
  isSuperAdmin: false,
};
```

## Type Parameters

### TMeta

`TMeta` = `Record`\<`string`, `unknown`\>

Shape of the optional [metadata](#metadata) field.

## Properties

### displayName?

> `optional` **displayName**: `string`

Defined in: packages/access/src/types.ts:114

Human-readable display name.

***

### isSuperAdmin?

> `optional` **isSuperAdmin**: `boolean`

Defined in: packages/access/src/types.ts:118

Whether this user bypasses all access checks.

***

### metadata?

> `optional` **metadata**: `TMeta`

Defined in: packages/access/src/types.ts:120

Arbitrary user metadata.

***

### roles

> **roles**: `string`[]

Defined in: packages/access/src/types.ts:116

Assigned roles.

***

### userId

> **userId**: `string`

Defined in: packages/access/src/types.ts:110

Unique user identifier (e.g., from JWT `sub` claim).

***

### username

> **username**: `string`

Defined in: packages/access/src/types.ts:112

Login username.
