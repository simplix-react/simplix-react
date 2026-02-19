[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SimplixConfig

# Interface: SimplixConfig

Defined in: [types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L56)

Project-level configuration loaded from `simplix.config.ts` at the project root.

## Remarks

Controls code generation behavior, mock layer defaults, package naming,
and OpenAPI domain splitting. All fields are optional — sensible defaults
are applied when omitted.

## Example

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  api: { baseUrl: "/api/v1" },
  packages: { prefix: "acme" },
  codegen: { header: true },
  openapi: {
    domains: {
      project: ["Projects", "Tasks"],
      auth: ["Auth", "Users"],
    },
  },
});
```

## See

[defineConfig](../functions/defineConfig.md) — identity wrapper for type-safe autocompletion

## Properties

### api?

> `optional` **api**: `object`

Defined in: [types.ts:58](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L58)

API settings — used for basePath in code generation

#### baseUrl?

> `optional` **baseUrl**: `string`

API base path (default: "/api")

***

### codegen?

> `optional` **codegen**: `object`

Defined in: [types.ts:78](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L78)

Code generation options

#### header?

> `optional` **header**: `boolean`

Prepend auto-generated header comment to generated files (default: true)

***

### http?

> `optional` **http**: `object`

Defined in: [types.ts:73](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L73)

.http file environment settings

#### environments?

> `optional` **environments**: `Record`\<`string`, [`SimplixHttpEnvironment`](SimplixHttpEnvironment.md)\>

***

### i18n?

> `optional` **i18n**: `object`

Defined in: [types.ts:84](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L84)

Internationalization settings

#### defaultLocale?

> `optional` **defaultLocale**: `string`

Default locale code (default: "en")

#### locales?

> `optional` **locales**: `string`[]

Supported locale codes (default: ["en", "ko", "ja"])

***

### openapi?

> `optional` **openapi**: `object`

Defined in: [types.ts:92](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L92)

OpenAPI code generation options

#### crud?

> `optional` **crud**: `Partial`\<`Record`\<`CrudRole`, [`CrudEndpointPattern`](CrudEndpointPattern.md)\>\>

CRUD role detection patterns. When omitted, no CRUD roles are assigned.

#### domains?

> `optional` **domains**: `Record`\<`string`, `string`[]\>

Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/)

***

### packages?

> `optional` **packages**: `object`

Defined in: [types.ts:67](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L67)

Package naming options

#### prefix?

> `optional` **prefix**: `string`

Short prefix for generated package names (default: derived from root package.json name)

***

### queryBuilder?

> `optional` **queryBuilder**: `unknown`

Defined in: [types.ts:64](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L64)

Global QueryBuilder — applied to all domains
