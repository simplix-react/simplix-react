[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / registerResponseAdapterPreset

# Function: registerResponseAdapterPreset()

> **registerResponseAdapterPreset**(`name`, `preset`): `void`

Defined in: [openapi/plugin-registry.ts:105](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L105)

Registers a named response adapter preset into the global registry.

Response adapter presets control how generated hooks unwrap API responses.

## Parameters

### name

`string`

The preset name referenced in response adapter configs

### preset

[`ResponseAdapterPreset`](../interfaces/ResponseAdapterPreset.md)

The response adapter preset definition

## Returns

`void`

## Example

```ts
import { registerResponseAdapterPreset } from "@simplix-react/cli";

registerResponseAdapterPreset("my-api", {
  unwrapExpression: "data?.result",
  mockResponseWrapper: "wrapMyApiResponse",
});
```
