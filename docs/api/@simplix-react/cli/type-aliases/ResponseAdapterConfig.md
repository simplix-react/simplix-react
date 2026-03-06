[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / ResponseAdapterConfig

# Type Alias: ResponseAdapterConfig

> **ResponseAdapterConfig** = `"boot"` \| `"raw"` \| `string` \| \{ `unwrap?`: (`data`) => `unknown`; `unwrapByRole?`: `Partial`\<`Record`\<`CrudRole`, `string`\>\>; `unwrapExpression?`: `string`; \}

Defined in: [openapi/adaptation/response-adapter.ts:25](https://github.com/simplix-react/simplix-react/blob/main/openapi/adaptation/response-adapter.ts#L25)

Configuration for controlling how generated hook wrappers unwrap API responses.

## Type Declaration

`"boot"`

`"raw"`

`string`

\{ `unwrap?`: (`data`) => `unknown`; `unwrapByRole?`: `Partial`\<`Record`\<`CrudRole`, `string`\>\>; `unwrapExpression?`: `string`; \}

### ~~unwrap()?~~

> `optional` **unwrap**: (`data`) => `unknown`

#### Parameters

##### data

`unknown`

#### Returns

`unknown`

#### Deprecated

Not supported in code generation — use unwrapExpression instead

### unwrapByRole?

> `optional` **unwrapByRole**: `Partial`\<`Record`\<`CrudRole`, `string`\>\>

Per-role unwrap override (e.g., list vs get need different expressions)

### unwrapExpression?

> `optional` **unwrapExpression**: `string`

Simple unwrap via expression (variable name: `data`)

## Remarks

Accepts either a preset name string or a fine-grained object configuration:
- `"boot"` — unwraps Spring Boot envelope (`data?.body`)
- `"raw"` — no unwrapping (default)
- Custom string — references a [ResponseAdapterPreset](../interfaces/ResponseAdapterPreset.md) registered via the plugin registry
- Object — provides `unwrapExpression` and/or per-role `unwrapByRole` overrides

## Example

```ts
// Use a preset
const config: ResponseAdapterConfig = "boot";

// Use a custom unwrap expression
const config: ResponseAdapterConfig = {
  unwrapExpression: "data?.result",
  unwrapByRole: { list: "data?.result?.items" },
};
```
