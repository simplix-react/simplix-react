[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / CrudRole

# Type Alias: CrudRole

> **CrudRole** = `"list"` \| `"get"` \| `"create"` \| `"update"` \| `"delete"` \| `"tree"`

Defined in: [packages/contract/src/types.ts:52](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/contract/src/types.ts#L52)

CRUD role identifier. Used for automatic mapping between operation names
and their semantic roles (list, get, create, update, delete, tree).

Operations named after a CRUD role are automatically mapped; custom names
require an explicit `role` property.

## See

[EntityOperationDef.role](../interfaces/EntityOperationDef.md#role) for explicit role assignment.
