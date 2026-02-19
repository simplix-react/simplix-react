[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / normalizeRole

# Function: normalizeRole()

> **normalizeRole**(`role`): `string`

Defined in: [packages/access/src/helpers/role-utils.ts:50](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/helpers/role-utils.ts#L50)

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
