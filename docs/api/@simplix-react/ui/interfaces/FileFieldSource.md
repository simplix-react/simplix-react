[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FileFieldSource

# Interface: FileFieldSource

Defined in: [packages/ui/src/fields/file-attachment/types.ts:82](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L82)

Source descriptor for the standard per-module attachment API.

Lets a screen wire FileField/ImageField by passing only the module's
attachment address; [createFileFieldApi](../functions/createFileFieldApi.md) builds the FileFieldApi against
the uniform endpoint shape `{basePath}/{id}/attachment/{group}/{op}`. The
field accepts this via its `source` prop as an alternative to a hand-built
`api` (which stays the escape hatch for non-conforming backends).

## Properties

### authenticatedBlob?

> `optional` **authenticatedBlob**: `boolean`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:98](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L98)

When true and a blob transport is registered, expose `fetchBlobUrl` so the
field displays/downloads bytes via the authenticated download/thumbnail
endpoints. Omit (default) to rely on the record's public `url`.

***

### basePath

> **basePath**: `string`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L84)

Module attachment base, e.g. `"/api/v1/admin/banner"`.

***

### entityId?

> `optional` **entityId**: `string`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L88)

Saved entity id (edit mode). Absent → pre-save `TEMP_<tempEntityId>`.

***

### group

> **group**: `string`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L86)

Attachment group/slot, e.g. `"banner"` (server allowlist-validated).

***

### onMutated()?

> `optional` **onMutated**: () => `void`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:116](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L116)

Called after a successful mutating op (upload / delete / reorder /
representative / updateDescription) — e.g. to invalidate host caches. NOT
called for read ops (list / fetchBlobUrl).

#### Returns

`void`

***

### publicUrlBuilder()?

> `optional` **publicUrlBuilder**: (`group`, `attachmentId`, `opts?`) => `string` \| `undefined`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:106](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L106)

Rewrites a record's display `url`/`thumbnailUrl` to a token-free public URL
(e.g. public-site logo/favicon served without Bearer auth). Applied to
upload / list / updateDescription results; return `undefined` to keep the
record's existing url. MUTUALLY EXCLUSIVE with `authenticatedBlob` — when
set, `fetchBlobUrl` is NOT exposed (public url takes precedence).

#### Parameters

##### group

`string`

##### attachmentId

`string`

##### opts?

###### thumbnail?

`boolean`

#### Returns

`string` \| `undefined`

***

### strategy?

> `optional` **strategy**: `string`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:92](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L92)

Mutator strategy name registered by the host (default `"boot"`).

***

### tempEntityId?

> `optional` **tempEntityId**: `string`

Defined in: [packages/ui/src/fields/file-attachment/types.ts:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L90)

Stable id scoping pre-save temp uploads before the entity exists.
