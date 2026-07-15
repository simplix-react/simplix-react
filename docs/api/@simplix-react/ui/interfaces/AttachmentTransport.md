[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / AttachmentTransport

# Interface: AttachmentTransport

Defined in: [packages/ui/src/fields/file-attachment/attachment-transport.ts:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/attachment-transport.ts#L11)

Host-registered transport for attachment upload (with real progress) and
authenticated blob reads.

The library stays HTTP-agnostic: the host registers an implementation backed
by its own auth stack (e.g. boot-auth's `uploadWithProgress` /
`fetchAttachmentBlob`, which carry the bearer token + 401 refresh-retry).
When nothing is registered, [createFileFieldApi](../functions/createFileFieldApi.md) falls back to the
plain mutator (terminal progress, no authenticated blob).

## Properties

### fetchBlob()?

> `optional` **fetchBlob**: (`url`) => `Promise`\<`Blob`\>

Defined in: [packages/ui/src/fields/file-attachment/attachment-transport.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/attachment-transport.ts#L19)

Authenticated blob fetch for download/thumbnail bytes.

#### Parameters

##### url

`string`

#### Returns

`Promise`\<`Blob`\>

***

### upload()?

> `optional` **upload**: \<`T`\>(`url`, `formData`, `opts?`) => `Promise`\<`T`\>

Defined in: [packages/ui/src/fields/file-attachment/attachment-transport.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/attachment-transport.ts#L13)

Multipart upload reporting 0–100 progress; resolves the unwrapped record.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### url

`string`

##### formData

`FormData`

##### opts?

###### onProgress?

(`percent`) => `void`

###### signal?

`AbortSignal`

#### Returns

`Promise`\<`T`\>
