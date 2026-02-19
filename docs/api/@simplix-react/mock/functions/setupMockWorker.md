[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / setupMockWorker

# Function: setupMockWorker()

> **setupMockWorker**(`config`): `Promise`\<`void`\>

Defined in: [msw.ts:105](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/msw.ts#L105)

Bootstraps a complete mock environment with MSW and in-memory stores.

Performs the following steps in order:
1. Filters domains to only those with `enabled !== false`
2. Resets the in-memory store
3. Seeds each entity store from domain seed data
4. Starts the MSW service worker with the combined handlers

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
  domains: [projectDomain, userDomain],
});
```

## See

 - [MockServerConfig](../interfaces/MockServerConfig.md) - Configuration shape.
 - [MockDomainConfig](../interfaces/MockDomainConfig.md) - Individual domain configuration.
 - [deriveMockHandlers](deriveMockHandlers.md) - Generates MSW handlers from a contract.
