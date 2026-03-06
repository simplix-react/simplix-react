[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SpecProfile

# Interface: SpecProfile

Defined in: [openapi/orchestration/spec-profile.ts:39](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L39)

Bundles a naming strategy and response adapter as a reusable preset for a backend convention.

## Remarks

Registered via [registerSpecProfile](../functions/registerSpecProfile.md) or as part of a [CliPlugin](CliPlugin.md).
Referenced by name in `simplix.config.ts` via the `profile` field.

## Example

```ts
// simplix.config.ts
export default {
  specs: [
    { spec: "openapi/boot.json", profile: "simplix-boot", domains: { ... } },
  ],
};
```

## Properties

### dependencies?

> `optional` **dependencies**: `Record`\<`string`, `string`\>

Defined in: [openapi/orchestration/spec-profile.ts:50](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L50)

Extra dependencies to inject into the domain package.json

***

### i18nDownloader?

> `optional` **i18nDownloader**: [`I18nDownloader`](../type-aliases/I18nDownloader.md)

Defined in: [openapi/orchestration/spec-profile.ts:54](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L54)

Callback for downloading and transforming i18n data from a server

***

### i18nEndpoint?

> `optional` **i18nEndpoint**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:52](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L52)

Server-relative i18n endpoint path for downloading translations at codegen time

***

### mutatorHint?

> `optional` **mutatorHint**: `object`

Defined in: [openapi/orchestration/spec-profile.ts:43](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L43)

Hint for app-providers.tsx mutator setup (used by scaffold)

#### errorAdapterExpression

> **errorAdapterExpression**: `string`

#### errorAdapterImport

> **errorAdapterImport**: `string`

***

### mutatorStrategy?

> `optional` **mutatorStrategy**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:48](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L48)

Mutator strategy name for configureMutator/getMutator registry

***

### naming

> **naming**: [`OpenApiNamingStrategy`](OpenApiNamingStrategy.md)

Defined in: [openapi/orchestration/spec-profile.ts:40](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L40)

***

### responseAdapter

> **responseAdapter**: [`ResponseAdapterConfig`](../type-aliases/ResponseAdapterConfig.md)

Defined in: [openapi/orchestration/spec-profile.ts:41](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L41)
