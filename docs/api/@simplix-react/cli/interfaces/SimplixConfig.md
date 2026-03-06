[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SimplixConfig

# Interface: SimplixConfig

Defined in: [config/types.ts:59](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L59)

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

Defined in: [config/types.ts:61](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L61)

API settings — used for basePath in code generation

#### baseUrl?

> `optional` **baseUrl**: `string`

API base path (default: "/api")

***

### codegen?

> `optional` **codegen**: `object`

Defined in: [config/types.ts:81](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L81)

Code generation options

#### header?

> `optional` **header**: `boolean`

Prepend auto-generated header comment to generated files (default: true)

***

### http?

> `optional` **http**: `object`

Defined in: [config/types.ts:76](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L76)

.http file environment settings

#### environments?

> `optional` **environments**: `Record`\<`string`, [`SimplixHttpEnvironment`](SimplixHttpEnvironment.md)\>

***

### i18n?

> `optional` **i18n**: `object`

Defined in: [config/types.ts:87](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L87)

Internationalization settings

#### defaultLocale?

> `optional` **defaultLocale**: `string`

Default locale code (default: "en")

#### locales?

> `optional` **locales**: `string`[]

Supported locale codes (default: ["en", "ko", "ja"])

***

### openapi?

> `optional` **openapi**: [`OpenAPISpecConfig`](OpenAPISpecConfig.md)[]

Defined in: [config/types.ts:95](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L95)

OpenAPI code generation — array of per-spec configurations

***

### packages?

> `optional` **packages**: `object`

Defined in: [config/types.ts:70](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L70)

Package naming options

#### prefix?

> `optional` **prefix**: `string`

Short prefix for generated package names (default: derived from root package.json name)

***

### queryBuilder?

> `optional` **queryBuilder**: `unknown`

Defined in: [config/types.ts:67](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L67)

Global QueryBuilder — applied to all domains
