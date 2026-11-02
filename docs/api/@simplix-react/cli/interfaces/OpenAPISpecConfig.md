[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OpenAPISpecConfig

# Interface: OpenAPISpecConfig

Defined in: [config/types.ts:391](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L391)

Per-spec OpenAPI configuration

## Properties

### crud?

> `optional` **crud**: `Partial`\<`Record`\<`CrudRole`, [`CrudEndpointPattern`](CrudEndpointPattern.md)\>\>

Defined in: [config/types.ts:408](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L408)

CRUD role detection patterns. When omitted, no CRUD roles are assigned.

***

### domains

> **domains**: `Record`\<`string`, `string`[]\>

Defined in: [config/types.ts:406](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L406)

Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/)

***

### meta?

> `optional` **meta**: [`OpenAPIMetaConfig`](OpenAPIMetaConfig.md)

Defined in: [config/types.ts:410](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L410)

DTO metadata generation. Omit the block and the meta pipeline does not run for this spec.

***

### naming?

> `optional` **naming**: [`OpenApiNamingStrategy`](OpenApiNamingStrategy.md)

Defined in: [config/types.ts:402](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L402)

NamingStrategy — overrides profile's naming if both are set

***

### profile?

> `optional` **profile**: `string`

Defined in: [config/types.ts:400](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L400)

Spec Profile preset name (bundles naming + responseAdapter)

***

### responseAdapter?

> `optional` **responseAdapter**: [`ResponseAdapterConfig`](../type-aliases/ResponseAdapterConfig.md)

Defined in: [config/types.ts:404](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L404)

ResponseAdapter — overrides profile's responseAdapter if both are set

***

### spec?

> `optional` **spec**: `string`

Defined in: [config/types.ts:398](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L398)

The OpenAPI document the Orval half reads. Optional: a project that has finished migrating
runs `simplix meta`, which needs no document — it states `meta.source` instead. `simplix
openapi` still requires one and says so.
