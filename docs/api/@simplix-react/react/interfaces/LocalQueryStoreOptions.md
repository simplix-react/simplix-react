[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / LocalQueryStoreOptions

# Interface: LocalQueryStoreOptions

Defined in: [packages/react/src/local-query.ts:10](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L10)

Options for [createLocalQueryStore](../functions/createLocalQueryStore.md).

## Properties

### maxAge?

> `optional` **maxAge**: `number`

Defined in: [packages/react/src/local-query.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L24)

Maximum age of the persisted cache; entries older than this are dropped on
restore. Defaults to 24 hours.

***

### storage?

> `optional` **storage**: `Storage`

Defined in: [packages/react/src/local-query.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L30)

Storage backend. Defaults to `window.localStorage`, or a no-op when no
`Storage` is available (e.g. SSR).

***

### storageKey

> **storageKey**: `string`

Defined in: [packages/react/src/local-query.ts:18](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L18)

`localStorage` key the dehydrated cache is written under.

***

### version

> **version**: `string`

Defined in: [packages/react/src/local-query.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L15)

Cache-busting token. On restore, a mismatch discards the entire persisted
cache — bump it whenever the persisted shape (or app version) changes.
