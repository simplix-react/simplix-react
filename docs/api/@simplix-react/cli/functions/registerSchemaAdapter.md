[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / registerSchemaAdapter

# Function: registerSchemaAdapter()

> **registerSchemaAdapter**(`adapter`): `void`

Defined in: [openapi/plugin-registry.ts:149](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L149)

Registers a schema adapter for unwrapping vendor-specific schema wrappers.

Adapters are evaluated in registration order during code generation.

## Parameters

### adapter

[`SchemaAdapter`](../interfaces/SchemaAdapter.md)

The schema adapter to register

## Returns

`void`

## Example

```ts
import { registerSchemaAdapter } from "@simplix-react/cli";

registerSchemaAdapter({
  id: "hateoas",
  canUnwrap: (s) => !!s._embedded,
  unwrap: (s) => s._embedded as Record<string, unknown>,
});
```
