[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / CRUD\_OPERATIONS

# Variable: CRUD\_OPERATIONS

> `const` **CRUD\_OPERATIONS**: `object`

Defined in: [packages/contract/src/types.ts:190](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/contract/src/types.ts#L190)

Standard CRUD operation method defaults. Spread and customize per entity.

## Type Declaration

### create

> **create**: `object`

#### create.method

> **method**: `"POST"`

### delete

> **delete**: `object`

#### delete.method

> **method**: `"DELETE"`

### get

> **get**: `object`

#### get.method

> **method**: `"GET"`

### list

> **list**: `object`

#### list.method

> **method**: `"GET"`

### update

> **update**: `object`

#### update.method

> **method**: `"PATCH"`

## Example

```ts
operations: {
  list:   { ...CRUD_OPERATIONS.list,   path: "/products" },
  get:    { ...CRUD_OPERATIONS.get,    path: "/products/:id" },
  create: { ...CRUD_OPERATIONS.create, path: "/products", input: createSchema },
  update: { ...CRUD_OPERATIONS.update, path: "/products/:id", input: updateSchema },
  delete: { ...CRUD_OPERATIONS.delete, path: "/products/:id" },
}
```
