[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / hasAnyRole

# Function: hasAnyRole()

> **hasAnyRole**(`roles`, `targetRoles`): `boolean`

Defined in: packages/access/src/helpers/role-utils.ts:43

Checks if any of the target roles exist in the given role list.

## Parameters

### roles

`string`[]

The user's current role list.

### targetRoles

`string`[]

Roles to check (with or without `ROLE_` prefix).

## Returns

`boolean`

`true` if at least one target role is found.
