[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useInvalidateEntity

# Function: useInvalidateEntity()

> **useInvalidateEntity**(`apiPrefix`): () => `void`

Defined in: [packages/ui/src/crud/form/use-invalidate-entity.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-invalidate-entity.ts#L16)

Returns a stable callback that invalidates all queries whose first key
element starts with the given URL prefix.

Invalidation is deferred to the next macrotask so that React can process
navigation state updates first. This prevents refetching queries for
components that are about to unmount (e.g. edit forms with gcTime: 0).

Works with Orval-generated query keys like:
- `['/api/v1/company/4']` (detail)
- `['/api/v1/company/search', params]` (list)

## Parameters

### apiPrefix

`string`

## Returns

> (): `void`

### Returns

`void`
