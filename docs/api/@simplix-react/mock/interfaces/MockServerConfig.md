[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockServerConfig

# Interface: MockServerConfig

Defined in: [msw.ts:76](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/msw.ts#L76)

Describes the configuration required by [setupMockWorker](../functions/setupMockWorker.md).

Combines multiple [MockDomainConfig](MockDomainConfig.md) entries into a single bootstrap
configuration.

## Example

```ts
import type { MockServerConfig } from "@simplix-react/mock";

const config: MockServerConfig = {
  domains: [projectDomain, userDomain],
};
```

## See

 - [setupMockWorker](../functions/setupMockWorker.md) - Consumes this config to bootstrap the mock environment.
 - [MockDomainConfig](MockDomainConfig.md) - Individual domain configuration.

## Properties

### domains

> **domains**: [`MockDomainConfig`](MockDomainConfig.md)[]

Defined in: [msw.ts:78](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/mock/src/msw.ts#L78)

Domain configurations to activate.
