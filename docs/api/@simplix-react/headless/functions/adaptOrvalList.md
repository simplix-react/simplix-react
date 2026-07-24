[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / adaptOrvalList

# Function: adaptOrvalList()

> **adaptOrvalList**\<`T`\>(`useApiHook`, `options?`): [`ListHook`](../interfaces/ListHook.md)\<`T`\>

Defined in: [adapt-orval-list.ts:56](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-list.ts#L56)

Adapt an Orval-generated list hook to the [ListHook](../interfaces/ListHook.md) interface
expected by a list state machine in `"server"` mode (the web `useCrudList`
page model).

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

Handles the following conversions (via [buildSearchableParams](buildSearchableParams.md)):
- Page: 1-based to 0-based (Spring Data).
- Size: `pagination.limit` to `size`.
- Sort: `{ field, direction }` to `["field.direction"]`.
- Response: Spring Data Page (`content`, `totalElements`) to `ListHookResult`.

## Example

```ts
const useListPetsAdapted = adaptOrvalList<Pet>(useGetPets);
const list = useCrudList(useListPetsAdapted, { stateMode: "server" });
```
