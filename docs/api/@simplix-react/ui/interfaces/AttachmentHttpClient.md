[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / AttachmentHttpClient

# Interface: AttachmentHttpClient

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L10)

Minimal HTTP client surface required by [createFileFieldApi](../functions/createFileFieldApi.md), satisfied
structurally by an axios instance. Kept local so the library takes NO axios
dependency (consistent with file-attachment's HTTP-agnostic design); the host
injects its own configured client carrying auth headers and the
SimpliXApiResponse unwrapping interceptor.

## Methods

### delete()

> **delete**(`url`): `Promise`\<`unknown`\>

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L23)

#### Parameters

##### url

`string`

#### Returns

`Promise`\<`unknown`\>

***

### get()

> **get**(`url`, `config?`): `Promise`\<\{ `data`: `unknown`; \}\>

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L19)

#### Parameters

##### url

`string`

##### config?

###### params?

`Record`\<`string`, `unknown`\>

###### responseType?

`"blob"`

#### Returns

`Promise`\<\{ `data`: `unknown`; \}\>

***

### patch()

> **patch**(`url`, `data?`, `config?`): `Promise`\<\{ `data`: \{ `body?`: `unknown`; \}; \}\>

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L24)

#### Parameters

##### url

`string`

##### data?

`unknown`

##### config?

###### params?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<\{ `data`: \{ `body?`: `unknown`; \}; \}\>

***

### post()

> **post**(`url`, `data`, `config?`): `Promise`\<\{ `data`: \{ `body?`: `unknown`; \}; \}\>

Defined in: [packages/ui/src/fields/file-attachment/create-file-field-api.ts:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/create-file-field-api.ts#L11)

#### Parameters

##### url

`string`

##### data

`FormData`

##### config?

###### onUploadProgress?

(`event`) => `void`

###### signal?

`AbortSignal`

#### Returns

`Promise`\<\{ `data`: \{ `body?`: `unknown`; \}; \}\>
