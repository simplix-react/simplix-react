[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / adaptOrvalGet

# Function: adaptOrvalGet()

> **adaptOrvalGet**\<`T`, `Q`\>(`query`): `Omit`\<`Q`, `"data"`\> & `object`

Defined in: [adapt-orval-get.ts:54](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L54)

Re-type an Orval-generated GET/detail query result so `data` is the entity
DTO (`T | undefined`) instead of the raw response envelope, while preserving
the other query fields (`isLoading`, `isError`, `error`, `refetch`, …).

Read-side counterpart of [adaptOrvalList](adaptOrvalList.md). It is runtime-safe: the same
query object reference is returned unchanged — only its static type narrows.
The boot mutator already unwraps the Boot envelope, so `query.data` is the
plain DTO at runtime; this adapter aligns the type with that reality and
removes the need for `as any` casts at call sites.

## Type Parameters

### T

`T`

Entity DTO type the endpoint resolves to.

### Q

`Q` *extends* [`OrvalGetResultLike`](../interfaces/OrvalGetResultLike.md) = [`OrvalGetResultLike`](../interfaces/OrvalGetResultLike.md) & [`OrvalGetQueryFields`](../interfaces/OrvalGetQueryFields.md)

Query result type; inferred when passed explicitly (e.g.
  `adaptOrvalGet<Dto, typeof query>(query)`) to preserve every field, or the
  common-fields default for the single-argument form.

## Parameters

### query

`Q`

Result of an Orval-generated `useGet*` query hook.

## Returns

`Omit`\<`Q`, `"data"`\> & `object`

The same query object with `data` typed as `T | undefined`.

## Example

```ts
// Single type argument — preserves the common React Query fields:
const { data, isLoading } = adaptOrvalGet<Company>(useGetCompany(id));
//      ^? Company | undefined

// Two type arguments — preserves the exact query result type:
const q = useGetCompany(id);
const { data, refetch } = adaptOrvalGet<Company, typeof q>(q);
```
