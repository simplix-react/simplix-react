# @simplix-react-ext/simplix-boot-cli-plugin

CLI plugin that registers the `simplix-boot` spec profile, the `boot` response adapter, and a Boot envelope schema adapter into the `@simplix-react/cli` global registry.

## Installation

```bash
pnpm add -D @simplix-react-ext/simplix-boot-cli-plugin
```

> **Prerequisites:** Requires `@simplix-react/cli` as a peer dependency.

This package is side-effect only. Its entry point calls `registerPlugin()` and `registerSchemaAdapter()` from `@simplix-react/cli` when imported; it exposes no runtime exports.

## Usage

### Enable the plugin

The CLI is config-driven and does not auto-load this package. Enable it by listing it in the `plugins` array of `simplix.config.ts`:

```ts
// simplix.config.ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  plugins: ["@simplix-react-ext/simplix-boot-cli-plugin"],
  // ...
});
```

When the CLI loads, it imports each entry in `plugins`, which runs this package's registration side effects and makes the `simplix-boot` profile available.

### Use the profile

Reference the `simplix-boot` profile per spec in the `openapi` config, then run code generation to derive the contract, entity, and operation hooks:

```ts
// simplix.config.ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  plugins: ["@simplix-react-ext/simplix-boot-cli-plugin"],
  openapi: [
    {
      spec: "my-api-spec.json",
      profile: "simplix-boot",
      domains: {
        // domainName: [tagPatterns]
      },
    },
  ],
});
```

```bash
simplix openapi my-api-spec.json
```

## What the Plugin Registers

`registerPlugin()` registers a plugin with id `simplix-boot` that contributes a spec profile named `simplix-boot` and a response adapter named `boot`. `registerSchemaAdapter()` registers the Boot schema adapter separately.

| Registration | Name | Description |
| --- | --- | --- |
| Naming strategy | `simplixBootNaming` | Resolves entity names from the Boot tag format `scope.crud.EntityName` (PascalCase entity segment to camelCase) and maps CRUD path patterns to operation roles and hook names. |
| Response adapter | `boot` | Configures Boot envelope handling for generated code: `bootResponseAdapter` for error conversion and `wrapEnvelope` for mock responses, both imported from `@simplix-react-ext/simplix-boot-auth`. |
| Schema adapter | `bootSchemaAdapter` | Strips the Boot envelope (`type`, `message`, `body`, `timestamp`, `errorCode`, `errorDetail`) so generated types reflect the inner `body` payload instead of the envelope. |
| i18n downloader | `/api/v1/dev/i18n/messages` | Downloads entity field and enum message translations from the running server and transforms them into per-locale domain data. |

The `simplix-boot` profile also sets a `mutatorStrategy` of `"boot"` and declares a dependency on `@simplix-react-ext/simplix-boot-auth`, which the generated project pulls in for envelope handling.

### Naming strategy

`simplixBootNaming` reads the OpenAPI tag in the form `scope.crud.EntityName` and uses the last dot-separated segment as the entity name, converting its leading character to lowercase. Operations are resolved from the HTTP method and path pattern:

- `GET /entity/search` → list
- `GET /entity/{id}` → get
- `GET /entity/{id}/edit` → getForEdit
- `GET /entity/tree` and `GET /entity/tree/{id}` → tree and subtree
- `POST /entity/create` → create
- `PUT /entity/{id}` → update
- `PATCH /entity/batch` → batchUpdate
- `DELETE /entity/batch` → batchDelete

Custom sub-path and sub-resource segments are turned into camelCase action names (for example `POST /entity/{id}/unpair` → unpair).

### Schema adapter

`bootSchemaAdapter` recognizes a Boot envelope when the schema has string `type` and `message` properties plus a non-empty object `body`. It unwraps the schema to the `body` sub-schema and strips the `SimpliXApiResponse` type-name prefix so generated types are named after the inner payload.

### i18n downloader

The downloader fetches translations from `<serverOrigin>/api/v1/dev/i18n/messages` (with a 5-second timeout). It maps server entity keys (PascalCase) to domain entity keys (camelCase) and produces per-locale data for the requested locales. If the request fails or returns no usable data, it returns nothing and code generation proceeds without downloaded translations.

## How Loading Works

Loading is config-driven. The CLI reads `config.plugins` from `simplix.config.ts` and imports each listed package; there is no hardcoded extension name and no auto-loading. Importing this package triggers its registration side effects, after which the `simplix-boot` profile can be referenced by `openapi[].profile`.

If an `openapi` entry references a profile whose plugin is not listed in `plugins` (or not installed), `simplix openapi` reports the missing profile as an error and exits.

## Related

- [simplix-boot extension overview](../../README.md)
- [CLI usage guide](../../../../docs/guides/cli-usage.md)
- [Extensions guide](../../../../docs/guides/extensions.md)
