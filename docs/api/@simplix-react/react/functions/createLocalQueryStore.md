[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/react](../README.md) / createLocalQueryStore

# Function: createLocalQueryStore()

> **createLocalQueryStore**(`opts`): `object`

Defined in: [packages/react/src/local-query.ts:74](https://github.com/simplix-react/simplix-react/blob/main/packages/react/src/local-query.ts#L74)

Creates an isolated "local query" store: a registry of query keys whose
react-query cache entries should be persisted to `localStorage` and kept
fresh until explicitly invalidated.

The returned `persistOptions` is spread directly into a
`PersistQueryClientProvider`; only the registered keys are dehydrated (and
only when successful), so volatile list/detail queries are never persisted.

## Parameters

### opts

[`LocalQueryStoreOptions`](../interfaces/LocalQueryStoreOptions.md)

Store configuration ([LocalQueryStoreOptions](../interfaces/LocalQueryStoreOptions.md)).

## Returns

`localQuery` (define + register an app-owned query), `localQueryKey`
  (register a framework-owned query by key only), and `persistOptions` for the
  provider.

### localQuery()

> **localQuery**: \<`TData`\>(`def`) => `OmitKeyof`\<`UseQueryOptions`\<`TData`, `Error`, `TData`, readonly `unknown`[]\>, `"queryFn"`\> & `object` & `object`

Defines an app-owned query and registers its key for persistence. Returns
a `queryOptions` object consumable by `useQuery`.

#### Type Parameters

##### TData

`TData`

The resolved query data type.

#### Parameters

##### def

[`LocalQueryDef`](../interfaces/LocalQueryDef.md)\<`TData`\>

The query definition ([LocalQueryDef](../interfaces/LocalQueryDef.md)).

#### Returns

`OmitKeyof`\<`UseQueryOptions`\<`TData`, `Error`, `TData`, readonly `unknown`[]\>, `"queryFn"`\> & `object` & `object`

A `queryOptions` object (staleTime `Infinity` and gcTime `maxAge` by default).

### localQueryKey()

> **localQueryKey**: (`key`) => `void`

Registers a query key (prefix) for persistence without owning its fetch —
use this for queries owned by a framework provider (e.g. a menu provider).

#### Parameters

##### key

readonly `unknown`[]

The query key prefix to persist (e.g. `["menu", "tree"]`).

#### Returns

`void`

### persistOptions

> **persistOptions**: `Omit`\<`PersistQueryClientOptions`, `"queryClient"`\>

## Example

```ts
const store = createLocalQueryStore({ version: "1", storageKey: "app:cache" });
store.localQueryKey(["menu", "tree"]);                 // framework-owned
const policy = store.localQuery({ key: ["policy"], queryFn });  // app-owned
// <PersistQueryClientProvider client={qc} persistOptions={store.persistOptions} />
```
