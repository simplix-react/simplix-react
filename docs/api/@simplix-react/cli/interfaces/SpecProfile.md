[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SpecProfile

# Interface: SpecProfile

Defined in: [openapi/orchestration/spec-profile.ts:77](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L77)

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

### containerTypes?

> `optional` **containerTypes**: `Record`\<`string`, [`ContainerMapping`](ContainerMapping.md)\>

Defined in: [openapi/orchestration/spec-profile.ts:98](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L98)

Java container name → the TypeScript type and zod factory it becomes.

***

### dependencies?

> `optional` **dependencies**: `Record`\<`string`, `string`\>

Defined in: [openapi/orchestration/spec-profile.ts:88](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L88)

Extra dependencies to inject into the domain package.json

***

### i18nDownloader?

> `optional` **i18nDownloader**: [`I18nDownloader`](../type-aliases/I18nDownloader.md)

Defined in: [openapi/orchestration/spec-profile.ts:92](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L92)

Callback for downloading and transforming i18n data from a server

***

### i18nEndpoint?

> `optional` **i18nEndpoint**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:90](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L90)

Server-relative i18n endpoint path for downloading translations at codegen time

***

### labeledEnum?

> `optional` **labeledEnum**: `LabeledEnumMapping`

Defined in: [openapi/orchestration/spec-profile.ts:104](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L104)

The generic that wraps an enum value with its label, which a backend serializing a labeled
enum as an object needs. Absent, every enum is its bare value union in both directions — the
honest reading for a backend that does not label them.

***

### metaDownloader()?

> `optional` **metaDownloader**: (`serverOrigin`) => `Promise`\<`DtoMeta` \| `undefined`\>

Defined in: [openapi/orchestration/spec-profile.ts:96](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L96)

Callback for downloading SimpliX Meta from a server.

#### Parameters

##### serverOrigin

`string`

#### Returns

`Promise`\<`DtoMeta` \| `undefined`\>

***

### metaEndpoint?

> `optional` **metaEndpoint**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:94](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L94)

Server-relative path of the DTO meta endpoint.

***

### metaExtensions()?

> `optional` **metaExtensions**: (`meta`) => [`MetaExtensionOutput`](MetaExtensionOutput.md) \| `undefined`

Defined in: [openapi/orchestration/spec-profile.ts:106](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L106)

Turns a contributor's `extensions` payload into generated files.

#### Parameters

##### meta

`DtoMeta`

#### Returns

[`MetaExtensionOutput`](MetaExtensionOutput.md) \| `undefined`

***

### mutatorHint?

> `optional` **mutatorHint**: `object`

Defined in: [openapi/orchestration/spec-profile.ts:81](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L81)

Hint for app-providers.tsx mutator setup (used by scaffold)

#### errorAdapterExpression

> **errorAdapterExpression**: `string`

#### errorAdapterImport

> **errorAdapterImport**: `string`

***

### mutatorStrategy?

> `optional` **mutatorStrategy**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:86](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L86)

Mutator strategy name for configureMutator/getMutator registry

***

### naming

> **naming**: [`OpenApiNamingStrategy`](OpenApiNamingStrategy.md)

Defined in: [openapi/orchestration/spec-profile.ts:78](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L78)

***

### responseAdapter

> **responseAdapter**: [`ResponseAdapterConfig`](../type-aliases/ResponseAdapterConfig.md)

Defined in: [openapi/orchestration/spec-profile.ts:79](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L79)
