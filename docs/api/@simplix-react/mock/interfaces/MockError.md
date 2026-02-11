[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockError

# Interface: MockError

Defined in: [sql/error-mapping.ts:8](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/sql/error-mapping.ts#L8)

Represents a mapped database error with an HTTP-friendly status code.

Produced by [mapPgError](../functions/mapPgError.md) from raw PostgreSQL/PGlite exceptions.

## See

[mapPgError](../functions/mapPgError.md) - Creates instances from raw errors.

## Properties

### code

> **code**: `string`

Defined in: [sql/error-mapping.ts:12](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/sql/error-mapping.ts#L12)

A machine-readable error code (e.g. `"unique_violation"`, `"not_found"`).

***

### message

> **message**: `string`

Defined in: [sql/error-mapping.ts:14](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/sql/error-mapping.ts#L14)

A human-readable error description.

***

### status

> **status**: `number`

Defined in: [sql/error-mapping.ts:10](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/mock/src/sql/error-mapping.ts#L10)

The HTTP status code corresponding to the error type.
