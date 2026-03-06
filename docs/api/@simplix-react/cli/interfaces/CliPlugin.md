[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / CliPlugin

# Interface: CliPlugin

Defined in: [openapi/plugin-registry.ts:22](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L22)

Defines a CLI plugin that bundles spec profiles and response adapter presets.

Plugins are registered via [registerPlugin](../functions/registerPlugin.md) to make their presets
available throughout the CLI pipeline.

## Example

```ts
import { registerPlugin, type CliPlugin } from "@simplix-react/cli";

const myPlugin: CliPlugin = {
  id: "my-backend",
  specs: { "my-backend": mySpecProfile },
  responseAdapters: { "my-backend": myAdapterPreset },
};
registerPlugin(myPlugin);
```

## Properties

### id

> **id**: `string`

Defined in: [openapi/plugin-registry.ts:24](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L24)

Unique identifier for this plugin.

***

### responseAdapters?

> `optional` **responseAdapters**: `Record`\<`string`, [`ResponseAdapterPreset`](ResponseAdapterPreset.md)\>

Defined in: [openapi/plugin-registry.ts:28](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L28)

Named response adapter presets to register (key = preset name).

***

### specs?

> `optional` **specs**: `Record`\<`string`, [`SpecProfile`](SpecProfile.md)\>

Defined in: [openapi/plugin-registry.ts:26](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L26)

Named spec profiles to register (key = profile name).
