[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / adaptOrvalList

# Function: adaptOrvalList()

> **adaptOrvalList**\<`T`\>(`useApiHook`, `options?`): [`ListHook`](../interfaces/ListHook.md)\<`T`\>

Defined in: [packages/ui/src/crud/list/adapt-orval-list.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/adapt-orval-list.ts#L54)

Adapt an Orval-generated list hook to the [ListHook](../interfaces/ListHook.md) interface
expected by [useCrudList](useCrudList.md) with `stateMode: "server"`.

## Type Parameters

### T

`T`

Row data type.

## Parameters

### useApiHook

[`OrvalListHookLike`](../type-aliases/OrvalListHookLike.md)

Orval-generated list query hook.

### options?

[`AdaptOrvalListOptions`](../interfaces/AdaptOrvalListOptions.md)

Optional query configuration (e.g. cache overrides).

## Returns

[`ListHook`](../interfaces/ListHook.md)\<`T`\>

A [ListHook](../interfaces/ListHook.md) compatible with `useCrudList`.

## Remarks

Handles the following conversions:
- Page: 1-based (`useCrudList`) to 0-based (Spring Data).
- Size: `pagination.limit` to `size`.
- Sort: `{ field, direction }` to `["field.direction"]`.
- Response: Spring Data Page (`content`, `totalElements`) to `ListHookResult`.

## Example

```ts
const useListPetsAdapted = adaptOrvalList<Pet>(useGetPets);
const list = useCrudList(useListPetsAdapted, { stateMode: "server" });
```
