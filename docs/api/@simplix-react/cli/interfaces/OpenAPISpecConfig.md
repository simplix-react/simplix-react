[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OpenAPISpecConfig

# Interface: OpenAPISpecConfig

Defined in: [config/types.ts:99](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L99)

Per-spec OpenAPI configuration

## Properties

### crud?

> `optional` **crud**: `Partial`\<`Record`\<`CrudRole`, [`CrudEndpointPattern`](CrudEndpointPattern.md)\>\>

Defined in: [config/types.ts:111](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L111)

CRUD role detection patterns. When omitted, no CRUD roles are assigned.

***

### domains

> **domains**: `Record`\<`string`, `string`[]\>

Defined in: [config/types.ts:109](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L109)

Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/)

***

### naming?

> `optional` **naming**: [`OpenApiNamingStrategy`](OpenApiNamingStrategy.md)

Defined in: [config/types.ts:105](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L105)

NamingStrategy — overrides profile's naming if both are set

***

### profile?

> `optional` **profile**: `string`

Defined in: [config/types.ts:103](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L103)

Spec Profile preset name (bundles naming + responseAdapter)

***

### responseAdapter?

> `optional` **responseAdapter**: [`ResponseAdapterConfig`](../type-aliases/ResponseAdapterConfig.md)

Defined in: [config/types.ts:107](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L107)

ResponseAdapter — overrides profile's responseAdapter if both are set

***

### spec

> **spec**: `string`

Defined in: [config/types.ts:101](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L101)

OpenAPI spec file path (relative to project root) or URL
