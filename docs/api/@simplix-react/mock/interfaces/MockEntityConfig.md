[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockEntityConfig

# Interface: MockEntityConfig

Defined in: [derive-mock-handlers.ts:41](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L41)

Provides per-entity configuration for mock handler generation.

Allows overriding pagination limits, sort order, relation loading,
and custom operation resolvers for a specific entity.

## Example

```ts
import type { MockEntityConfig } from "@simplix-react/mock";

const taskConfig: MockEntityConfig = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultSort: "createdAt:desc",
  relations: {
    project: {
      entity: "project",
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

Defined in: [derive-mock-handlers.ts:47](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L47)

Default number of rows per page.

#### Default Value

```ts
50
```

***

### defaultSort?

> `optional` **defaultSort**: `string`

Defined in: [derive-mock-handlers.ts:59](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L59)

Default sort in `"field:direction"` format (camelCase).

#### Default Value

`"createdAt:desc"`

***

### maxLimit?

> `optional` **maxLimit**: `number`

Defined in: [derive-mock-handlers.ts:53](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L53)

Maximum allowed rows per page.

#### Default Value

```ts
100
```

***

### relations?

> `optional` **relations**: `Record`\<`string`, \{ `entity`: `string`; `foreignKey?`: `string`; `localKey`: `string`; `type`: `"belongsTo"`; \}\>

Defined in: [derive-mock-handlers.ts:61](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L61)

Map of relation names to their `belongsTo` join configuration.

***

### resolvers?

> `optional` **resolvers**: `Record`\<`string`, (`info`) => `Response` \| `Promise`\<`Response`\>\>

Defined in: [derive-mock-handlers.ts:68](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L68)

Custom resolvers for non-CRUD operations, keyed by operation name.
