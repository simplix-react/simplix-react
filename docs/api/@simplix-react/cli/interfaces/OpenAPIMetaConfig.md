[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OpenAPIMetaConfig

# Interface: OpenAPIMetaConfig

Defined in: [config/types.ts:372](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L372)

DTO metadata generation for one spec.

## Remarks

SimpliX Meta is served by the backend and carries what an OpenAPI document loses — validation
constraints, search operators, `@PreAuthorize` and labeled enums. It is generated into
`src/generated-meta/` of every domain package the spec produces.

## Properties

### export?

> `optional` **export**: `string`[]

Defined in: [config/types.ts:381](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L381)

Domains whose barrel exports the meta output instead of the orval output.

***

### ignoreTags?

> `optional` **ignoreTags**: `string`[]

Defined in: [config/types.ts:387](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L387)

Tags no domain claims on purpose (a development controller, an API browser), as glob patterns
over the dot-separated tag: `*` matches within one segment, `**` across segments. A tag matched
here is neither warned about nor refused by `--strict`.

***

### snapshot?

> `optional` **snapshot**: `string`

Defined in: [config/types.ts:379](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L379)

Where a fetched SimpliX Meta is written for offline regeneration.

***

### source?

> `optional` **source**: `string`

Defined in: [config/types.ts:377](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L377)

Endpoint URL or snapshot path. Omit it and the source is built the way the i18n download
already builds its own: the origin of `spec` plus the profile's `metaEndpoint`.
