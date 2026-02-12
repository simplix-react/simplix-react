[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockEntityConfig

# Interface: MockEntityConfig

Defined in: [derive-mock-handlers.ts:36](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/mock/src/derive-mock-handlers.ts#L36)

Provides per-entity configuration for mock handler generation.

Allows overriding the default table name, pagination limits, sort order,
and relation loading for a specific entity when calling [deriveMockHandlers](../functions/deriveMockHandlers.md).

## Example

```ts
import type { MockEntityConfig } from "@simplix-react/mock";

const taskConfig: MockEntityConfig = {
  tableName: "tasks",
  defaultLimit: 20,
  maxLimit: 100,
  defaultSort: "created_at DESC",
  relations: {
    project: {
      table: "projects",
      localKey: "projectId",
      type: "belongsTo",
    },
  },
};
```

## See

[deriveMockHandlers](../functions/deriveMockHandlers.md) - Consumes this config per entity.

## Properties

### defaultLimit?

> `optional` **defaultLimit**: `number`

Defined in: [derive-mock-handlers.ts:44](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/mock/src/derive-mock-handlers.ts#L44)

Default number of rows per page.

#### Default Value

```ts
50
```

***

### defaultSort?

> `optional` **defaultSort**: `string`

Defined in: [derive-mock-handlers.ts:56](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/mock/src/derive-mock-handlers.ts#L56)

Default SQL ORDER BY clause.

#### Default Value

`"created_at DESC"`

***

### maxLimit?

> `optional` **maxLimit**: `number`

Defined in: [derive-mock-handlers.ts:50](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/mock/src/derive-mock-handlers.ts#L50)

Maximum allowed rows per page.

#### Default Value

```ts
100
```

***

### relations?

> `optional` **relations**: `Record`\<`string`, \{ `foreignKey?`: `string`; `localKey`: `string`; `table`: `string`; `type`: `"belongsTo"`; \}\>

Defined in: [derive-mock-handlers.ts:58](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/mock/src/derive-mock-handlers.ts#L58)

Map of relation names to their `belongsTo` join configuration.

***

### tableName?

> `optional` **tableName**: `string`

Defined in: [derive-mock-handlers.ts:38](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/mock/src/derive-mock-handlers.ts#L38)

Overrides the auto-derived PostgreSQL table name.
