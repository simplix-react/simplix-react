[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / setupMockWorker

# Function: setupMockWorker()

> **setupMockWorker**(`config`): `Promise`\<`void`\>

Defined in: [msw.ts:122](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L122)

Bootstraps a complete mock environment with PGlite and MSW.

Performs the following steps in order:
1. Filters domains to only those with `enabled !== false`
2. Initializes a PGlite instance at the configured `dataDir`
3. Runs all migration functions across enabled domains sequentially
4. Runs all seed functions across enabled domains sequentially
5. Starts the MSW service worker with the combined handlers

## Parameters

### config

[`MockServerConfig`](../interfaces/MockServerConfig.md)

The [MockServerConfig](../interfaces/MockServerConfig.md) describing domains and their setup.

## Returns

`Promise`\<`void`\>

## Example

```ts
import { setupMockWorker } from "@simplix-react/mock";

await setupMockWorker({
  dataDir: "idb://my-app-mock",
  domains: [projectDomain, userDomain],
});
```

## See

 - [MockServerConfig](../interfaces/MockServerConfig.md) - Configuration shape.
 - [MockDomainConfig](../interfaces/MockDomainConfig.md) - Individual domain configuration.
 - [deriveMockHandlers](deriveMockHandlers.md) - Generates MSW handlers from a contract.
 - [initPGlite](initPGlite.md) - Underlying PGlite initialization.
