[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockDomainConfig

# Interface: MockDomainConfig

Defined in: [msw.ts:31](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/msw.ts#L31)

Describes a single domain's mock configuration.

Each domain groups its own handlers and seed data together,
enabling selective activation via the [enabled](#enabled) flag.

## Example

```ts
import type { MockDomainConfig } from "@simplix-react/mock";
import { deriveMockHandlers } from "@simplix-react/mock";
import { projectContract } from "./contract";

const projectDomain: MockDomainConfig = {
  name: "project",
  handlers: deriveMockHandlers(projectContract.config),
  seed: {
    project_tasks: [
      { id: 1, title: "Task 1", createdAt: "2025-01-01" },
    ],
  },
};
```

## See

 - [MockServerConfig](MockServerConfig.md) - Aggregates multiple domains.
 - [setupMockWorker](../functions/setupMockWorker.md) - Consumes domains to bootstrap the mock environment.

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [msw.ts:40](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/msw.ts#L40)

Whether this domain is active.

#### Default Value

`true`

***

### handlers

> **handlers**: `unknown`[]

Defined in: [msw.ts:47](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/msw.ts#L47)

MSW request handlers for this domain.

Typically produced by [deriveMockHandlers](../functions/deriveMockHandlers.md).

***

### name

> **name**: `string`

Defined in: [msw.ts:33](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/msw.ts#L33)

Unique name identifying this domain (used for logging/debugging).

***

### seed?

> `optional` **seed**: `Record`\<`string`, `Record`\<`string`, `unknown`\>[]\>

Defined in: [msw.ts:55](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/msw.ts#L55)

Seed data keyed by entity store name.

Each key corresponds to a store name (e.g. `"project_tasks"`)
and the value is an array of records to pre-populate.
