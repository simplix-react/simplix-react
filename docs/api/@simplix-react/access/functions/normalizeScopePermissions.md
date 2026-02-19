[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / normalizeScopePermissions

# Function: normalizeScopePermissions()

> **normalizeScopePermissions**(`scopes`, `separator?`): `SubjectRawRule`\<`string`, `string`, `MongoQuery`\>[]

Defined in: [packages/access/src/helpers/normalize-rules.ts:90](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/helpers/normalize-rules.ts#L90)

Converts an OAuth2-style scope string into CASL rules.

## Parameters

### scopes

`string`

Space-delimited scope string (e.g., `"pet:read pet:write"`).

### separator?

`string` = `":"`

Delimiter within each scope. Defaults to `":"`.

## Returns

`SubjectRawRule`\<`string`, `string`, `MongoQuery`\>[]

An array of CASL rules.

## Example

```ts
import { normalizeScopePermissions } from "@simplix-react/access";

normalizeScopePermissions("pet:read pet:write");
// → [{ action: "read", subject: "pet" }, { action: "write", subject: "pet" }]
```
