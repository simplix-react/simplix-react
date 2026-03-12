[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OperationContext

# Interface: OperationContext

Defined in: [openapi/naming/naming-strategy.ts:34](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L34)

Context provided to `resolveOperation()` for mapping an OpenAPI operation
to a CRUD role and a human-friendly hook name.

## Properties

### description?

> `optional` **description**: `string`

Defined in: [openapi/naming/naming-strategy.ts:48](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L48)

Operation description from the spec

***

### entityName

> **entityName**: `string`

Defined in: [openapi/naming/naming-strategy.ts:44](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L44)

Entity name resolved by resolveEntityName() (camelCase)

***

### extensions

> **extensions**: `Record`\<`string`, `unknown`\>

Defined in: [openapi/naming/naming-strategy.ts:58](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L58)

x-* extensions from the operation object

***

### method

> **method**: `string`

Defined in: [openapi/naming/naming-strategy.ts:38](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L38)

HTTP method (uppercase: GET, POST, PUT, DELETE, PATCH)

***

### operationId

> **operationId**: `string`

Defined in: [openapi/naming/naming-strategy.ts:36](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L36)

operationId (may be auto-generated with numeric suffixes)

***

### path

> **path**: `string`

Defined in: [openapi/naming/naming-strategy.ts:40](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L40)

Full path (e.g., "/api/v1/admin/user/account/{userId}")

***

### pathParams

> **pathParams**: `string`[]

Defined in: [openapi/naming/naming-strategy.ts:54](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L54)

Path parameter names

***

### queryParams

> **queryParams**: `string`[]

Defined in: [openapi/naming/naming-strategy.ts:56](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L56)

Query parameter names

***

### requestType?

> `optional` **requestType**: `string`

Defined in: [openapi/naming/naming-strategy.ts:52](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L52)

Request body schema name

***

### responseType?

> `optional` **responseType**: `string`

Defined in: [openapi/naming/naming-strategy.ts:50](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L50)

200 response schema name

***

### summary?

> `optional` **summary**: `string`

Defined in: [openapi/naming/naming-strategy.ts:46](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L46)

Operation summary from the spec

***

### tag?

> `optional` **tag**: `string`

Defined in: [openapi/naming/naming-strategy.ts:42](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L42)

Tag this operation belongs to
