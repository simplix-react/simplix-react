[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / registerSpecProfile

# Function: registerSpecProfile()

> **registerSpecProfile**(`name`, `profile`): `void`

Defined in: [openapi/plugin-registry.ts:102](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L102)

Registers a named spec profile into the global registry.

Spec profiles bundle a naming strategy and response adapter config
for a specific backend convention (e.g., Spring Boot, NestJS).

## Parameters

### name

`string`

The profile name referenced in `simplix.config.ts`

### profile

[`SpecProfile`](../interfaces/SpecProfile.md)

The spec profile definition

## Returns

`void`

## Example

```ts
import { registerSpecProfile } from "@simplix-react/cli";

registerSpecProfile("spring-boot", {
  naming: springBootNamingStrategy,
  responseAdapter: "boot",
});
```
