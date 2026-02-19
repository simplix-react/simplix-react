[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / resolveRole

# Function: resolveRole()

> **resolveRole**(`name`, `operation`): [`CrudRole`](../type-aliases/CrudRole.md) \| `undefined`

Defined in: packages/contract/src/helpers/resolve-role.ts:27

Resolves the CRUD role for an entity operation.

Returns the explicit `role` if specified, otherwise infers it from the
operation name if it matches a standard CRUD name.

## Parameters

### name

`string`

The operation key name (e.g. `"list"`, `"archive"`).

### operation

[`EntityOperationDef`](../interfaces/EntityOperationDef.md)

The operation definition.

## Returns

[`CrudRole`](../type-aliases/CrudRole.md) \| `undefined`

The resolved CRUD role, or `undefined` for custom operations.

## Example

```ts
resolveRole("list", { method: "GET", path: "/products" });
// "list"

resolveRole("fetchAll", { method: "GET", path: "/products", role: "list" });
// "list"

resolveRole("archive", { method: "POST", path: "/products/:id/archive" });
// undefined
```
