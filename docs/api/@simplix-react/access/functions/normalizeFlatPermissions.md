[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / normalizeFlatPermissions

# Function: normalizeFlatPermissions()

> **normalizeFlatPermissions**(`permissions`, `separator?`): `SubjectRawRule`\<`string`, `string`, `MongoQuery`\>[]

Defined in: [packages/access/src/helpers/normalize-rules.ts:57](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/helpers/normalize-rules.ts#L57)

Converts flat permission strings like `"PET:list"` into CASL rules.

## Parameters

### permissions

`string`[]

Array of permission strings (e.g., `["PET:list", "PET:view"]`).

### separator?

`string` = `":"`

Delimiter between subject and action. Defaults to `":"`.

## Returns

`SubjectRawRule`\<`string`, `string`, `MongoQuery`\>[]

An array of CASL rules.

## Remarks

If a string has no separator, it is treated as a subject with `"manage"` action
(e.g., `"ROLE_ADMIN"` becomes `{ action: "manage", subject: "ROLE_ADMIN" }`).

## Example

```ts
import { normalizeFlatPermissions } from "@simplix-react/access";

normalizeFlatPermissions(["PET:list", "PET:view"]);
// → [{ action: "list", subject: "PET" }, { action: "view", subject: "PET" }]
```
