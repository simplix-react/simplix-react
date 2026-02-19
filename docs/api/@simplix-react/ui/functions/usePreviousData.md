[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / usePreviousData

# Function: usePreviousData()

> **usePreviousData**\<`T`\>(`data`): `T` \| `undefined`

Defined in: [packages/ui/src/crud/detail/use-previous-data.ts:13](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/detail/use-previous-data.ts#L13)

Retains the last non-nullish data so the UI stays populated while
a refetch is in flight (e.g. when switching between detail items).

## Type Parameters

### T

`T`

## Parameters

### data

`T` | `null` | `undefined`

## Returns

`T` \| `undefined`

## Example

```tsx
const { data, isLoading } = useGet(id);
const displayData = usePreviousData(data);
```
