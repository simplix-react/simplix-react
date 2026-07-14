[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / FileFieldApi

# Interface: FileFieldApi

Defined in: [packages/ui/src/fields/file-attachment/types.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L48)

API surface the caller must provide.
NOTE (R2-3): this is a NEW abstraction — NOT a port of matilo AttachmentApiOperations.
Only the caller's implementation calls the actual HTTP layer; the hook calls props.api.*.

list() is required (used for setRepresentative re-sync per UD-2/R2-1).
reorder / updateDescription / setRepresentative are optional — hook no-ops when absent.

## Properties

### delete()

> **delete**: (`attachmentId`) => `Promise`\<`void`\>

Defined in: [packages/ui/src/fields/file-attachment/types.ts:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L55)

#### Parameters

##### attachmentId

`string`

#### Returns

`Promise`\<`void`\>

***

### fetchBlobUrl()?

> `optional` **fetchBlobUrl**: (`attachmentId`, `opts?`) => `Promise`\<`string`\>

Defined in: [packages/ui/src/fields/file-attachment/types.ts:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L67)

Fetches an authenticated object URL for an attachment's bytes.
Provide this when the file URL is permission-gated (Bearer auth) so the
field can display/download it via blob instead of a direct, unauthenticated
<img src>. Pass `{ thumbnail: true }` to fetch a small thumbnail (list rows)
instead of the full content (viewer / download). When omitted, the field
falls back to the record's public `url`.

#### Parameters

##### attachmentId

`string`

##### opts?

###### size?

`number`

###### thumbnail?

`boolean`

#### Returns

`Promise`\<`string`\>

***

### list()

> **list**: () => `Promise`\<[`AttachmentRecord`](AttachmentRecord.md)[]\>

Defined in: [packages/ui/src/fields/file-attachment/types.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L54)

#### Returns

`Promise`\<[`AttachmentRecord`](AttachmentRecord.md)[]\>

***

### reorder()?

> `optional` **reorder**: (`orders`) => `Promise`\<`void`\>

Defined in: [packages/ui/src/fields/file-attachment/types.ts:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L56)

#### Parameters

##### orders

`AttachmentOrderUpdate`[]

#### Returns

`Promise`\<`void`\>

***

### setRepresentative()?

> `optional` **setRepresentative**: (`attachmentId`, `representative`) => `Promise`\<`void`\>

Defined in: [packages/ui/src/fields/file-attachment/types.ts:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L58)

#### Parameters

##### attachmentId

`string`

##### representative

`boolean`

#### Returns

`Promise`\<`void`\>

***

### updateDescription()?

> `optional` **updateDescription**: (`attachmentId`, `dto`) => `Promise`\<[`AttachmentRecord`](AttachmentRecord.md)\>

Defined in: [packages/ui/src/fields/file-attachment/types.ts:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L57)

#### Parameters

##### attachmentId

`string`

##### dto

`AttachmentDescriptionUpdate`

#### Returns

`Promise`\<[`AttachmentRecord`](AttachmentRecord.md)\>

***

### upload()

> **upload**: (`file`, `onProgress?`, `signal?`) => `Promise`\<[`AttachmentRecord`](AttachmentRecord.md)\>

Defined in: [packages/ui/src/fields/file-attachment/types.ts:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/file-attachment/types.ts#L49)

#### Parameters

##### file

`File`

##### onProgress?

(`progress`) => `void`

##### signal?

`AbortSignal`

#### Returns

`Promise`\<[`AttachmentRecord`](AttachmentRecord.md)\>
