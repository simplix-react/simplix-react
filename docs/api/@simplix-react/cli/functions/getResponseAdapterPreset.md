[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / getResponseAdapterPreset

# Function: getResponseAdapterPreset()

> **getResponseAdapterPreset**(`name`): [`ResponseAdapterPreset`](../interfaces/ResponseAdapterPreset.md) \| `undefined`

Defined in: [openapi/plugin-registry.ts:170](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L170)

Looks up a response adapter preset by name.

## Parameters

### name

`string`

The preset name to look up

## Returns

[`ResponseAdapterPreset`](../interfaces/ResponseAdapterPreset.md) \| `undefined`

The matching [ResponseAdapterPreset](../interfaces/ResponseAdapterPreset.md), or `undefined` if not registered

## Example

```ts
import { getResponseAdapterPreset } from "@simplix-react/cli";

const preset = getResponseAdapterPreset("boot");
if (preset) {
  console.log(preset.unwrapExpression);
}
```
