[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockDomainConfig

# Interface: MockDomainConfig

Defined in: [msw.ts:31](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L31)

Describes a single domain's mock configuration.

Each domain groups its own handlers, migrations, and seed data together,
enabling selective activation via the [enabled](#enabled) flag.

## Example

```ts
import type { MockDomainConfig } from "@simplix-react/mock";
import { deriveMockHandlers } from "@simplix-react/mock";
import { projectContract } from "./contract";
import { runMigrations } from "./migrations";
import { seedData } from "./seed";

const projectDomain: MockDomainConfig = {
  name: "project",
  handlers: deriveMockHandlers(projectContract.config),
  migrations: [runMigrations],
  seed: [seedData],
};
```

## See

 - [MockServerConfig](MockServerConfig.md) - Aggregates multiple domains.
 - [setupMockWorker](../functions/setupMockWorker.md) - Consumes domains to bootstrap the mock environment.

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [msw.ts:40](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L40)

Whether this domain is active.

#### Default Value

`true`

***

### handlers

> **handlers**: `unknown`[]

Defined in: [msw.ts:47](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L47)

MSW request handlers for this domain.

Typically produced by [deriveMockHandlers](../functions/deriveMockHandlers.md).

***

### migrations

> **migrations**: (`db`) => `Promise`\<`void`\>[]

Defined in: [msw.ts:54](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L54)

Migration functions to run in order.

Each function receives the PGlite instance and should create or alter tables.

#### Parameters

##### db

`PGlite`

#### Returns

`Promise`\<`void`\>

***

### name

> **name**: `string`

Defined in: [msw.ts:33](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L33)

Unique name identifying this domain (used for logging/debugging).

***

### seed?

> `optional` **seed**: (`db`) => `Promise`\<`void`\>[]

Defined in: [msw.ts:61](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L61)

Seed functions to run in order (after all migrations across all domains complete).

Each function receives the PGlite instance and should insert initial data.

#### Parameters

##### db

`PGlite`

#### Returns

`Promise`\<`void`\>
