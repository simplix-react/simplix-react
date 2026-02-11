[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SimplixConfig

# Interface: SimplixConfig

Defined in: [types.ts:38](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/types.ts#L38)

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

Defined in: [types.ts:40](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/types.ts#L40)

API settings — used for basePath in code generation

#### baseUrl?

> `optional` **baseUrl**: `string`

API base path (default: "/api")

***

### codegen?

> `optional` **codegen**: `object`

Defined in: [types.ts:68](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/types.ts#L68)

Code generation options

#### header?

> `optional` **header**: `boolean`

Prepend auto-generated header comment to generated files (default: true)

***

### http?

> `optional` **http**: `object`

Defined in: [types.ts:55](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/types.ts#L55)

.http file environment settings

#### environments?

> `optional` **environments**: `Record`\<`string`, `SimplixHttpEnvironment`\>

***

### mock?

> `optional` **mock**: `object`

Defined in: [types.ts:60](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/types.ts#L60)

Mock layer defaults

#### dataDir?

> `optional` **dataDir**: `string`

PGlite IndexedDB storage path (default: "idb://simplix-mock")

#### defaultLimit?

> `optional` **defaultLimit**: `number`

#### maxLimit?

> `optional` **maxLimit**: `number`

***

### openapi?

> `optional` **openapi**: `object`

Defined in: [types.ts:74](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/types.ts#L74)

OpenAPI code generation options

#### domains?

> `optional` **domains**: `Record`\<`string`, `string`[]\>

Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/)

***

### packages?

> `optional` **packages**: `object`

Defined in: [types.ts:49](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/types.ts#L49)

Package naming options

#### prefix?

> `optional` **prefix**: `string`

Short prefix for generated package names (default: derived from root package.json name)

***

### queryBuilder?

> `optional` **queryBuilder**: `unknown`

Defined in: [types.ts:46](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/cli/src/config/types.ts#L46)

Global QueryBuilder — applied to all domains
