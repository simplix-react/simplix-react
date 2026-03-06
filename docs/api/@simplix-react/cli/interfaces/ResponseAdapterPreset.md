[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / ResponseAdapterPreset

# Interface: ResponseAdapterPreset

Defined in: [openapi/adaptation/response-adapter.ts:56](https://github.com/simplix-react/simplix-react/blob/main/openapi/adaptation/response-adapter.ts#L56)

Reusable preset definition for a response adapter.

## Remarks

Registered via [registerResponseAdapterPreset](../functions/registerResponseAdapterPreset.md) for reuse across specs.
Presets define how responses are unwrapped and how mock responses are wrapped.

## Example

```ts
import { registerResponseAdapterPreset } from "@simplix-react/cli";

registerResponseAdapterPreset("my-api", {
  unwrapExpression: "data?.payload",
  mockResponseWrapper: "wrapMyApiResponse",
  mockResponseWrapperImport: 'import { wrapMyApiResponse } from "./helpers"',
});
```

## Properties

### errorAdapterImport?

> `optional` **errorAdapterImport**: `string`

Defined in: [openapi/adaptation/response-adapter.ts:60](https://github.com/simplix-react/simplix-react/blob/main/openapi/adaptation/response-adapter.ts#L60)

Import statement for error adapter (used in mutator setup)

***

### errorAdapterName?

> `optional` **errorAdapterName**: `string`

Defined in: [openapi/adaptation/response-adapter.ts:62](https://github.com/simplix-react/simplix-react/blob/main/openapi/adaptation/response-adapter.ts#L62)

Error adapter export name

***

### mockResponseWrapper?

> `optional` **mockResponseWrapper**: `string`

Defined in: [openapi/adaptation/response-adapter.ts:64](https://github.com/simplix-react/simplix-react/blob/main/openapi/adaptation/response-adapter.ts#L64)

Mock response wrapper function name

***

### mockResponseWrapperImport?

> `optional` **mockResponseWrapperImport**: `string`

Defined in: [openapi/adaptation/response-adapter.ts:66](https://github.com/simplix-react/simplix-react/blob/main/openapi/adaptation/response-adapter.ts#L66)

Import statement for mock response wrapper

***

### unwrapExpression?

> `optional` **unwrapExpression**: `string`

Defined in: [openapi/adaptation/response-adapter.ts:58](https://github.com/simplix-react/simplix-react/blob/main/openapi/adaptation/response-adapter.ts#L58)

Unwrap expression template (variable name: `data`). Omit when mutator handles unwrap.
