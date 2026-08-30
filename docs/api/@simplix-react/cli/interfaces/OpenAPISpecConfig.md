[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OpenAPISpecConfig

# Interface: OpenAPISpecConfig

Defined in: [config/types.ts:139](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L139)

Per-spec OpenAPI configuration

## Properties

### crud?

> `optional` **crud**: `Partial`\<`Record`\<`CrudRole`, [`CrudEndpointPattern`](CrudEndpointPattern.md)\>\>

Defined in: [config/types.ts:156](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L156)

CRUD role detection patterns. When omitted, no CRUD roles are assigned.

***

### domains

> **domains**: `Record`\<`string`, `string`[]\>

Defined in: [config/types.ts:154](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L154)

Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/)

***

### meta?

> `optional` **meta**: [`OpenAPIMetaConfig`](OpenAPIMetaConfig.md)

Defined in: [config/types.ts:158](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L158)

DTO metadata generation. Omit the block and the meta pipeline does not run for this spec.

***

### naming?

> `optional` **naming**: [`OpenApiNamingStrategy`](OpenApiNamingStrategy.md)

Defined in: [config/types.ts:150](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L150)

NamingStrategy — overrides profile's naming if both are set

***

### profile?

> `optional` **profile**: `string`

Defined in: [config/types.ts:148](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L148)

Spec Profile preset name (bundles naming + responseAdapter)

***

### responseAdapter?

> `optional` **responseAdapter**: [`ResponseAdapterConfig`](../type-aliases/ResponseAdapterConfig.md)

Defined in: [config/types.ts:152](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L152)

ResponseAdapter — overrides profile's responseAdapter if both are set

***

### spec?

> `optional` **spec**: `string`

Defined in: [config/types.ts:146](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L146)

The OpenAPI document the Orval half reads. Optional: a project that has finished migrating
runs `simplix meta`, which needs no document — it states `meta.source` instead. `simplix
openapi` still requires one and says so.
