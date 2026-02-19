[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / hasRole

# Function: hasRole()

> **hasRole**(`roles`, `role`): `boolean`

Defined in: [packages/access/src/helpers/role-utils.ts:64](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/helpers/role-utils.ts#L64)

Checks if a role exists in the given role list.

## Parameters

### roles

`string`[]

The user's current role list.

### role

`string`

The role to search for (with or without `ROLE_` prefix).

## Returns

`boolean`

`true` if the role is found.

## Remarks

Comparison is prefix-insensitive: `"ADMIN"` matches `"ROLE_ADMIN"`.
