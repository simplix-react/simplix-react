[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / registerPlugin

# Function: registerPlugin()

> **registerPlugin**(`plugin`): `void`

Defined in: [openapi/plugin-registry.ts:223](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L223)

Registers all spec profiles and response adapter presets bundled in a plugin.

This is a convenience function that calls [registerSpecProfile](registerSpecProfile.md) and
[registerResponseAdapterPreset](registerResponseAdapterPreset.md) for each entry in the plugin.

## Parameters

### plugin

[`CliPlugin`](../interfaces/CliPlugin.md)

The CLI plugin to register

## Returns

`void`

## Example

```ts
import { registerPlugin } from "@simplix-react/cli";

registerPlugin({
  id: "my-backend",
  specs: { "my-backend": mySpecProfile },
  responseAdapters: { "my-backend": myAdapterPreset },
});
```
