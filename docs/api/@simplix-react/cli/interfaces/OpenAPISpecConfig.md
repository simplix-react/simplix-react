[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OpenAPISpecConfig

# Interface: OpenAPISpecConfig

Defined in: [config/types.ts:119](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L119)

Per-spec OpenAPI configuration

## Properties

### crud?

> `optional` **crud**: `Partial`\<`Record`\<`CrudRole`, [`CrudEndpointPattern`](CrudEndpointPattern.md)\>\>

Defined in: [config/types.ts:131](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L131)

CRUD role detection patterns. When omitted, no CRUD roles are assigned.

***

### domains

> **domains**: `Record`\<`string`, `string`[]\>

Defined in: [config/types.ts:129](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L129)

Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/)

***

### naming?

> `optional` **naming**: [`OpenApiNamingStrategy`](OpenApiNamingStrategy.md)

Defined in: [config/types.ts:125](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L125)

NamingStrategy — overrides profile's naming if both are set

***

### profile?

> `optional` **profile**: `string`

Defined in: [config/types.ts:123](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L123)

Spec Profile preset name (bundles naming + responseAdapter)

***

### responseAdapter?

> `optional` **responseAdapter**: [`ResponseAdapterConfig`](../type-aliases/ResponseAdapterConfig.md)

Defined in: [config/types.ts:127](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L127)

ResponseAdapter — overrides profile's responseAdapter if both are set

***

### spec

> **spec**: `string`

Defined in: [config/types.ts:121](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L121)

OpenAPI spec file path (relative to project root) or URL
