[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / normalizeRoles

# Function: normalizeRoles()

> **normalizeRoles**(`roles`): `string`[]

Defined in: [packages/access/src/helpers/role-utils.ts:25](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/helpers/role-utils.ts#L25)

Normalizes an array of mixed role inputs into plain role strings.

## Parameters

### roles

[`RoleInput`](../type-aliases/RoleInput.md)[]

Array of string roles or role objects.

## Returns

`string`[]

Array of plain role code strings.

## Remarks

Handles Spring Security role objects (`{ roleCode, roleName, name }`)
and plain strings. Empty or unresolvable entries are filtered out.

## Example

```ts
import { normalizeRoles } from "@simplix-react/access";

normalizeRoles(["ADMIN", { roleCode: "USER" }]); // ["ADMIN", "USER"]
```
