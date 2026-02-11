[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / defineConfig

# Function: defineConfig()

> **defineConfig**(`config`): [`SimplixConfig`](../interfaces/SimplixConfig.md)

Defined in: [define-config.ts:28](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/define-config.ts#L28)

Identity function that provides type-safe autocompletion for `simplix.config.ts`.

## Parameters

### config

[`SimplixConfig`](../interfaces/SimplixConfig.md)

Project-level Simplix configuration object

## Returns

[`SimplixConfig`](../interfaces/SimplixConfig.md)

The same config object, unchanged

## Remarks

Place a `simplix.config.ts` file at the project root and export the result
of `defineConfig()` as the default export. The CLI reads this file to
configure code generation, mock defaults, and package naming.

## Example

```ts
// simplix.config.ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  api: { baseUrl: "/api/v1" },
  packages: { prefix: "my-app" },
  mock: { defaultLimit: 20 },
});
```

## See

[SimplixConfig](../interfaces/SimplixConfig.md) for all available configuration options
