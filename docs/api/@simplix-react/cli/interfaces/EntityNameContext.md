[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / EntityNameContext

# Interface: EntityNameContext

Defined in: [openapi/naming/naming-strategy.ts:11](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L11)

Context provided to [OpenApiNamingStrategy.resolveEntityName](OpenApiNamingStrategy.md#resolveentityname) for deriving
the entity name from an OpenAPI tag group.

## Remarks

Contains the tag name, all paths and operations under that tag, referenced
schema names, and any `x-*` extensions from the tag object. The strategy
uses this information to produce a camelCase entity name.

## Properties

### extensions

> **extensions**: `Record`\<`string`, `unknown`\>

Defined in: [openapi/naming/naming-strategy.ts:27](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L27)

x-* extensions from the OpenAPI tag object

***

### operations

> **operations**: `object`[]

Defined in: [openapi/naming/naming-strategy.ts:17](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L17)

Operation summaries under this tag

#### method

> **method**: `string`

#### operationId

> **operationId**: `string`

#### path

> **path**: `string`

#### queryParams?

> `optional` **queryParams**: `string`[]

#### summary?

> `optional` **summary**: `string`

***

### paths

> **paths**: `string`[]

Defined in: [openapi/naming/naming-strategy.ts:15](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L15)

All paths belonging to this tag

***

### schemaNames

> **schemaNames**: `string`[]

Defined in: [openapi/naming/naming-strategy.ts:25](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L25)

DTO/schema names referenced by operations in this tag

***

### tag?

> `optional` **tag**: `string`

Defined in: [openapi/naming/naming-strategy.ts:13](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L13)

OpenAPI tag name — undefined for tag-less specs
