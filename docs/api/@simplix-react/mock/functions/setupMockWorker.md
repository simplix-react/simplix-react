[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / setupMockWorker

# Function: setupMockWorker()

> **setupMockWorker**(`config`): `Promise`\<`void`\>

Defined in: [msw.ts:90](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/mock/src/msw.ts#L90)

Bootstraps a complete mock environment with PGlite and MSW.

Performs the following steps in order:
1. Initializes a PGlite instance at the configured `dataDir`
2. Runs all migration functions sequentially
3. Runs all seed functions sequentially
4. Starts the MSW service worker with the provided handlers

## Parameters

### config

[`MockServerConfig`](../interfaces/MockServerConfig.md)

The [MockServerConfig](../interfaces/MockServerConfig.md) describing database setup and handlers.

## Returns

`Promise`\<`void`\>

## Example

```ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { projectContract } from "./contract";
import { runMigrations } from "./migrations";
import { seedData } from "./seed";

await setupMockWorker({
  dataDir: "idb://project-mock",
  migrations: [runMigrations],
  seed: [seedData],
  handlers: deriveMockHandlers(projectContract.config),
});
```

## See

 - [MockServerConfig](../interfaces/MockServerConfig.md) - Configuration shape.
 - [deriveMockHandlers](deriveMockHandlers.md) - Generates MSW handlers from a contract.
 - [initPGlite](initPGlite.md) - Underlying PGlite initialization.
