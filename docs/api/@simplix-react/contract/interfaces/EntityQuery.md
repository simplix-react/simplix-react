[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityQuery

# Interface: EntityQuery

Defined in: [packages/contract/src/types.ts:170](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L170)

Represents a named query scope that filters entities by a parent relationship.

Allows defining reusable query patterns like "tasks by project" that can be
referenced throughout the application.

## See

[EntityDefinition.queries](EntityDefinition.md#queries) where these are declared.

## Properties

### param

> **param**: `string`

Defined in: [packages/contract/src/types.ts:174](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L174)

Route parameter name used to scope the query (e.g. `"projectId"`).

***

### parent

> **parent**: `string`

Defined in: [packages/contract/src/types.ts:172](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L172)

Name of the parent entity this query filters by (e.g. `"project"`).
