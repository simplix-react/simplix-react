[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useInvalidateEntity

# Function: useInvalidateEntity()

> **useInvalidateEntity**(`apiPrefix`): () => `Promise`\<`void`\>

Defined in: [packages/ui/src/crud/form/use-invalidate-entity.ts:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-invalidate-entity.ts#L18)

Returns a stable callback that invalidates all queries whose first key
element starts with the given URL prefix.

Returns a Promise that resolves when all matching queries have been
refetched. Callers that need to sequence state resets after invalidation
(e.g. clearing draft state in inline editors) should `await` the result.
Fire-and-forget callers (e.g. `onSettled: invalidate`) are unaffected
by the return type change.

Works with Orval-generated query keys like:
- `['/api/v1/company/4']` (detail)
- `['/api/v1/company/search', params]` (list)

## Parameters

### apiPrefix

`string`

## Returns

> (): `Promise`\<`void`\>

### Returns

`Promise`\<`void`\>
