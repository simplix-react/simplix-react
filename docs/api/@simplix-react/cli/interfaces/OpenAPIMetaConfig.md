[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OpenAPIMetaConfig

# Interface: OpenAPIMetaConfig

Defined in: [config/types.ts:126](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L126)

DTO metadata generation for one spec.

## Remarks

SimpliX Meta is served by the backend and carries what an OpenAPI document loses — validation
constraints, search operators, `@PreAuthorize` and labeled enums. It is generated into
`src/generated-meta/` of every domain package the spec produces.

## Properties

### export?

> `optional` **export**: `string`[]

Defined in: [config/types.ts:135](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L135)

Domains whose barrel exports the meta output instead of the orval output.

***

### snapshot?

> `optional` **snapshot**: `string`

Defined in: [config/types.ts:133](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L133)

Where a fetched SimpliX Meta is written for offline regeneration.

***

### source?

> `optional` **source**: `string`

Defined in: [config/types.ts:131](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L131)

Endpoint URL or snapshot path. Omit it and the source is built the way the i18n download
already builds its own: the origin of `spec` plus the profile's `metaEndpoint`.
