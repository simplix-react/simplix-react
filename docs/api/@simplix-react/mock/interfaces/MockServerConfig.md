[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockServerConfig

# Interface: MockServerConfig

Defined in: [msw.ts:83](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L83)

Describes the configuration required by [setupMockWorker](../functions/setupMockWorker.md).

Combines multiple [MockDomainConfig](MockDomainConfig.md) entries into a single bootstrap
configuration with an optional shared data directory.

## Example

```ts
import type { MockServerConfig } from "@simplix-react/mock";

const config: MockServerConfig = {
  dataDir: "idb://my-app-mock",
  domains: [projectDomain, userDomain],
};
```

## See

 - [setupMockWorker](../functions/setupMockWorker.md) - Consumes this config to bootstrap the mock environment.
 - [MockDomainConfig](MockDomainConfig.md) - Individual domain configuration.

## Properties

### dataDir?

> `optional` **dataDir**: `string`

Defined in: [msw.ts:89](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L89)

IndexedDB data directory for PGlite persistence.

#### Default Value

`"idb://simplix-mock"`

***

### domains

> **domains**: [`MockDomainConfig`](MockDomainConfig.md)[]

Defined in: [msw.ts:92](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/mock/src/msw.ts#L92)

Domain configurations to activate.
