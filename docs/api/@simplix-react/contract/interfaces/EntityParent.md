[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityParent

# Interface: EntityParent

Defined in: [packages/contract/src/types.ts:22](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/types.ts#L22)

Describes the parent resource in a nested entity relationship.

Enables hierarchical URL construction such as `/projects/:projectId/tasks`.

## Example

```ts
const parent: EntityParent = {
  param: "projectId",
  path: "/projects",
};
// Produces: /projects/:projectId/tasks
```

## See

[EntityDefinition](EntityDefinition.md) for the entity that references this parent.

## Properties

### param

> **param**: `string`

Defined in: [packages/contract/src/types.ts:24](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/types.ts#L24)

Route parameter name used to identify the parent resource (e.g. `"projectId"`).

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:26](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/contract/src/types.ts#L26)

Base path segment for the parent resource (e.g. `"/projects"`).
