[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / createJwtAdapter

# Function: createJwtAdapter()

> **createJwtAdapter**(`options?`): [`AccessAdapter`](../interfaces/AccessAdapter.md)

Defined in: packages/access/src/adapters/jwt-adapter.ts:92

Creates an adapter that extracts access rules from a JWT token.

## Parameters

### options?

[`JwtAdapterOptions`](../interfaces/JwtAdapterOptions.md) = `{}`

JWT adapter configuration. All fields are optional.

## Returns

[`AccessAdapter`](../interfaces/AccessAdapter.md)

An [AccessAdapter](../interfaces/AccessAdapter.md) that extracts rules from JWT strings.

## Remarks

Decodes the JWT payload client-side (no signature verification)
and converts the claims into CASL rules. Supports three permission
formats: `"map"` (Spring Security), `"flat"` (authorities), and
`"scopes"` (OAuth2). Use `decode` for custom JWT formats and
`transform` to bypass default extraction entirely.

## Example

```ts
import { createJwtAdapter } from "@simplix-react/access";

const adapter = createJwtAdapter({
  permissionFormat: "flat",
  flatSeparator: ":",
  rolesKey: "authorities",
});
```

## See

[JwtAdapterOptions](../interfaces/JwtAdapterOptions.md) for all configuration options.
