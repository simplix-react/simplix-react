[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockServerConfig

# Interface: MockServerConfig

Defined in: [msw.ts:30](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/msw.ts#L30)

Describes the configuration required by [setupMockWorker](../functions/setupMockWorker.md).

Combines PGlite database setup (migrations and seed data) with MSW request
handlers into a single bootstrap configuration.

## Example

```ts
import type { MockServerConfig } from "@simplix-react/mock";
import { deriveMockHandlers } from "@simplix-react/mock";
import { projectContract } from "./contract";
import { runMigrations } from "./migrations";
import { seedData } from "./seed";

const config: MockServerConfig = {
  dataDir: "idb://project-mock",
  migrations: [runMigrations],
  seed: [seedData],
  handlers: deriveMockHandlers(projectContract.config),
};
```

## See

[setupMockWorker](../functions/setupMockWorker.md) - Consumes this config to bootstrap the mock environment.

## Properties

### dataDir?

> `optional` **dataDir**: `string`

Defined in: [msw.ts:36](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/msw.ts#L36)

IndexedDB data directory for PGlite persistence.

#### Default Value

`"idb://simplix-mock"`

***

### handlers

> **handlers**: `unknown`[]

Defined in: [msw.ts:57](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/msw.ts#L57)

MSW request handlers to register with the service worker.

Typically produced by [deriveMockHandlers](../functions/deriveMockHandlers.md).

***

### migrations

> **migrations**: (`db`) => `Promise`\<`void`\>[]

Defined in: [msw.ts:43](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/msw.ts#L43)

Migration functions to run in order.

Each function receives the PGlite instance and should create or alter tables.

#### Parameters

##### db

`PGlite`

#### Returns

`Promise`\<`void`\>

***

### seed

> **seed**: (`db`) => `Promise`\<`void`\>[]

Defined in: [msw.ts:50](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/msw.ts#L50)

Seed functions to run in order (after migrations).

Each function receives the PGlite instance and should insert initial data.

#### Parameters

##### db

`PGlite`

#### Returns

`Promise`\<`void`\>
