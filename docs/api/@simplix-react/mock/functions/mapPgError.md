[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / mapPgError

# Function: mapPgError()

> **mapPgError**(`err`): [`MockError`](../interfaces/MockError.md)

Defined in: [sql/error-mapping.ts:45](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/sql/error-mapping.ts#L45)

Maps a raw PostgreSQL/PGlite error to an HTTP-friendly [MockError](../interfaces/MockError.md).

Inspects the error message to classify the error:

| Pattern                  | Code                    | HTTP Status |
| ------------------------ | ----------------------- | ----------- |
| unique / duplicate       | `unique_violation`      | 409         |
| foreign key              | `foreign_key_violation` | 422         |
| not-null / null value    | `not_null_violation`    | 422         |
| not found / no rows      | `not_found`             | 404         |
| (unrecognized)           | `query_error`           | 500         |

## Parameters

### err

`unknown`

The raw error thrown by a PGlite query.

## Returns

[`MockError`](../interfaces/MockError.md)

A structured [MockError](../interfaces/MockError.md) with status, code, and message.

## Example

```ts
import { mapPgError } from "@simplix-react/mock";

try {
  await db.query("INSERT INTO tasks ...");
} catch (err) {
  const mapped = mapPgError(err);
  console.error(mapped.code, mapped.status); // e.g. "unique_violation" 409
}
```
