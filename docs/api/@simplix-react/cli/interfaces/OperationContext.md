[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OperationContext

# Interface: OperationContext

Defined in: [openapi/naming/naming-strategy.ts:35](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L35)

Context provided to `resolveOperation()` for mapping an OpenAPI operation
to a CRUD role and a human-friendly hook name.

## Properties

### description?

> `optional` **description**: `string`

Defined in: [openapi/naming/naming-strategy.ts:49](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L49)

Operation description from the spec

***

### entityName

> **entityName**: `string`

Defined in: [openapi/naming/naming-strategy.ts:45](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L45)

Entity name resolved by resolveEntityName() (camelCase)

***

### extensions

> **extensions**: `Record`\<`string`, `unknown`\>

Defined in: [openapi/naming/naming-strategy.ts:59](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L59)

x-* extensions from the operation object

***

### method

> **method**: `string`

Defined in: [openapi/naming/naming-strategy.ts:39](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L39)

HTTP method (uppercase: GET, POST, PUT, DELETE, PATCH)

***

### operationId

> **operationId**: `string`

Defined in: [openapi/naming/naming-strategy.ts:37](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L37)

operationId (may be auto-generated with numeric suffixes)

***

### path

> **path**: `string`

Defined in: [openapi/naming/naming-strategy.ts:41](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L41)

Full path (e.g., "/api/v1/admin/user/account/{userId}")

***

### pathParams

> **pathParams**: `string`[]

Defined in: [openapi/naming/naming-strategy.ts:55](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L55)

Path parameter names

***

### queryParams

> **queryParams**: `string`[]

Defined in: [openapi/naming/naming-strategy.ts:57](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L57)

Query parameter names

***

### requestType?

> `optional` **requestType**: `string`

Defined in: [openapi/naming/naming-strategy.ts:53](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L53)

Request body schema name

***

### responseType?

> `optional` **responseType**: `string`

Defined in: [openapi/naming/naming-strategy.ts:51](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L51)

200 response schema name

***

### summary?

> `optional` **summary**: `string`

Defined in: [openapi/naming/naming-strategy.ts:47](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L47)

Operation summary from the spec

***

### tag?

> `optional` **tag**: `string`

Defined in: [openapi/naming/naming-strategy.ts:43](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L43)

Tag this operation belongs to
