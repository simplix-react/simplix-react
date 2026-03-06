[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityParent

# Interface: EntityParent

Defined in: [packages/contract/src/types.ts:155](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L155)

Describes the parent resource in a nested entity relationship.

Enables hierarchical URL construction such as `/projects/:projectId/tasks`.

## Example

```ts
const parent: EntityParent = {
  param: "projectId",
  path: "/projects",
};
```

## See

[EntityDefinition](EntityDefinition.md) for the entity that references this parent.

## Properties

### param

> **param**: `string`

Defined in: [packages/contract/src/types.ts:157](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L157)

Route parameter name used to identify the parent resource (e.g. `"projectId"`).

***

### path

> **path**: `string`

Defined in: [packages/contract/src/types.ts:159](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L159)

Base path segment for the parent resource (e.g. `"/projects"`).
