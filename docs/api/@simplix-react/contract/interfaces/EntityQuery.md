[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityQuery

# Interface: EntityQuery

Defined in: [packages/contract/src/types.ts:37](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L37)

Represents a named query scope that filters entities by a parent relationship.

Allows defining reusable query patterns like "tasks by project" that can be
referenced throughout the application.

## See

[EntityDefinition.queries](EntityDefinition.md#queries) where these are declared.

## Properties

### param

> **param**: `string`

Defined in: [packages/contract/src/types.ts:41](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L41)

Route parameter name used to scope the query (e.g. `"projectId"`).

***

### parent

> **parent**: `string`

Defined in: [packages/contract/src/types.ts:39](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/contract/src/types.ts#L39)

Name of the parent entity this query filters by (e.g. `"project"`).
