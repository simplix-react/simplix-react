[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / normalizePermissionMap

# Function: normalizePermissionMap()

> **normalizePermissionMap**(`permissions`): `SubjectRawRule`\<`string`, `string`, `MongoQuery`\>[]

Defined in: [packages/access/src/helpers/normalize-rules.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/access/src/helpers/normalize-rules.ts#L26)

Converts a [PermissionMap](../interfaces/PermissionMap.md) into an array of CASL rules.

## Parameters

### permissions

`Record`\<`string`, `string`[]\>

Map of resource names to their allowed action arrays.

## Returns

`SubjectRawRule`\<`string`, `string`, `MongoQuery`\>[]

An array of CASL rules with `action` and `subject` fields.

## Example

```ts
import { normalizePermissionMap } from "@simplix-react/access";

normalizePermissionMap({ Pet: ["list", "view"] });
// → [{ action: "list", subject: "Pet" }, { action: "view", subject: "Pet" }]
```
