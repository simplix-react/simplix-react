[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / EntityQuery

# Interface: EntityQuery

Defined in: [packages/contract/src/types.ts:36](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L36)

Represents a named query scope that filters entities by a parent relationship.

Allows defining reusable query patterns like "tasks by project" that can be
referenced throughout the application.

## See

[EntityDefinition.queries](EntityDefinition.md#queries) where these are declared.

## Properties

### param

> **param**: `string`

Defined in: [packages/contract/src/types.ts:40](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L40)

Route parameter name used to scope the query (e.g. `"projectId"`).

***

### parent

> **parent**: `string`

Defined in: [packages/contract/src/types.ts:38](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/contract/src/types.ts#L38)

Name of the parent entity this query filters by (e.g. `"project"`).
