[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockEntityConfig

# Interface: MockEntityConfig

Defined in: [derive-mock-handlers.ts:40](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/derive-mock-handlers.ts#L40)

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

Defined in: [derive-mock-handlers.ts:46](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/derive-mock-handlers.ts#L46)

Default number of rows per page.

#### Default Value

```ts
50
```

***

### defaultSort?

> `optional` **defaultSort**: `string`

Defined in: [derive-mock-handlers.ts:58](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/derive-mock-handlers.ts#L58)

Default sort in `"field:direction"` format (camelCase).

#### Default Value

`"createdAt:desc"`

***

### maxLimit?

> `optional` **maxLimit**: `number`

Defined in: [derive-mock-handlers.ts:52](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/derive-mock-handlers.ts#L52)

Maximum allowed rows per page.

#### Default Value

```ts
100
```

***

### relations?

> `optional` **relations**: `Record`\<`string`, \{ `entity`: `string`; `foreignKey?`: `string`; `localKey`: `string`; `type`: `"belongsTo"`; \}\>

Defined in: [derive-mock-handlers.ts:60](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/derive-mock-handlers.ts#L60)

Map of relation names to their `belongsTo` join configuration.

***

### resolvers?

> `optional` **resolvers**: `Record`\<`string`, (`info`) => `Response` \| `Promise`\<`Response`\>\>

Defined in: [derive-mock-handlers.ts:67](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/derive-mock-handlers.ts#L67)

Custom resolvers for non-CRUD operations, keyed by operation name.
