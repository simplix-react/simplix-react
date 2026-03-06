[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / validateCrudSearch

# Function: validateCrudSearch()

> **validateCrudSearch**(`search`): [`CrudSearch`](../interfaces/CrudSearch.md)

Defined in: [packages/ui/src/crud/patterns/crud-search.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/crud-search.ts#L19)

Validates and extracts CRUD search params from a raw search object.
Use as `validateSearch` in TanStack Router route definitions.

## Parameters

### search

`Record`\<`string`, `unknown`\>

## Returns

[`CrudSearch`](../interfaces/CrudSearch.md)

## Example

```ts
export const Route = createFileRoute("/buildings/")({
  component: BuildingsRoute,
  validateSearch: validateCrudSearch,
});
```
