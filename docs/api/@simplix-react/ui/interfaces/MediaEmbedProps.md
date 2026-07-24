[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / MediaEmbedProps

# Interface: MediaEmbedProps

Defined in: [packages/ui/src/base/display/media-embed.tsx:4](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L4)

Props for the [MediaEmbed](../functions/MediaEmbed.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/display/media-embed.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L20)

***

### height?

> `optional` **height**: `number`

Defined in: [packages/ui/src/base/display/media-embed.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L17)

Frame height in CSS pixels; `video`/16:9 frames size themselves. Defaults to 384 for document frames.

***

### kind

> **kind**: `"video"` \| `"frame"`

Defined in: [packages/ui/src/base/display/media-embed.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L9)

`video` renders a native player for a self-hosted stream (playback-end
observable); `frame` embeds an external player or document viewer.

***

### onEnded()?

> `optional` **onEnded**: () => `void`

Defined in: [packages/ui/src/base/display/media-embed.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L15)

Fires when a `video` finishes playing (completion tracking).

#### Returns

`void`

***

### src

> **src**: `string`

Defined in: [packages/ui/src/base/display/media-embed.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L11)

Media/document source URL.

***

### title?

> `optional` **title**: `string`

Defined in: [packages/ui/src/base/display/media-embed.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L13)

Accessible title for the embedded frame.

***

### widescreen?

> `optional` **widescreen**: `boolean`

Defined in: [packages/ui/src/base/display/media-embed.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L19)

Render `frame` at a 16:9 aspect (external video embeds); defaults to false.
