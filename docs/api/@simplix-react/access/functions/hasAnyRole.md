[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / hasAnyRole

# Function: hasAnyRole()

> **hasAnyRole**(`roles`, `targetRoles`): `boolean`

Defined in: [packages/access/src/helpers/role-utils.ts:76](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/helpers/role-utils.ts#L76)

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
