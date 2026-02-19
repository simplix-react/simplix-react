[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / normalizeRole

# Function: normalizeRole()

> **normalizeRole**(`role`): `string`

Defined in: packages/access/src/helpers/role-utils.ts:17

Ensures a role string has the `ROLE_` prefix.

## Parameters

### role

`string`

Role name with or without the `ROLE_` prefix.

## Returns

`string`

The role string with `ROLE_` prefix guaranteed.

## Example

```ts
import { normalizeRole } from "@simplix-react/access";

normalizeRole("ADMIN");      // "ROLE_ADMIN"
normalizeRole("ROLE_ADMIN"); // "ROLE_ADMIN"
```
