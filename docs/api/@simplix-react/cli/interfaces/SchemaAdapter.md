[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SchemaAdapter

# Interface: SchemaAdapter

Defined in: [openapi/plugin-registry.ts:49](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L49)

Adapter for unwrapping vendor-specific schema wrappers during code generation.

Schema adapters are evaluated in registration order. The first adapter whose
`canUnwrap` returns `true` is used to unwrap the schema.

## Example

```ts
import { registerSchemaAdapter, type SchemaAdapter } from "@simplix-react/cli";

const adapter: SchemaAdapter = {
  id: "my-wrapper",
  canUnwrap: (schema) => !!schema["x-my-wrapper"],
  unwrap: (schema) => schema["x-my-wrapper"] as Record<string, unknown>,
};
registerSchemaAdapter(adapter);
```

## Properties

### id

> **id**: `string`

Defined in: [openapi/plugin-registry.ts:51](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L51)

Unique identifier for this adapter.

## Methods

### canUnwrap()

> **canUnwrap**(`schema`): `boolean`

Defined in: [openapi/plugin-registry.ts:53](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L53)

Returns `true` if this adapter can unwrap the given schema object.

#### Parameters

##### schema

`Record`\<`string`, `unknown`\>

#### Returns

`boolean`

***

### stripPrefix()?

> `optional` **stripPrefix**(`typeName`): `string`

Defined in: [openapi/plugin-registry.ts:57](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L57)

Optionally strips a vendor prefix from a generated type name.

#### Parameters

##### typeName

`string`

#### Returns

`string`

***

### unwrap()

> **unwrap**(`schema`): `Record`\<`string`, `unknown`\>

Defined in: [openapi/plugin-registry.ts:55](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L55)

Extracts the inner schema from a vendor wrapper.

#### Parameters

##### schema

`Record`\<`string`, `unknown`\>

#### Returns

`Record`\<`string`, `unknown`\>
