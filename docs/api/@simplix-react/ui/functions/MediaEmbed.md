[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / MediaEmbed

# Function: MediaEmbed()

> **MediaEmbed**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/display/media-embed.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/media-embed.tsx#L35)

Bordered media container for in-app content: a native video player for
self-hosted streams or an iframe for external embeds and document viewers.
Centralizes the border/rounding/aspect handling so call sites never place
raw `<video>`/`<iframe>` tags.

## Parameters

### \_\_namedParameters

[`MediaEmbedProps`](../interfaces/MediaEmbedProps.md)

## Returns

`Element`

## Example

```tsx
<MediaEmbed kind="video" src={signedUrl} onEnded={markWatched} />
<MediaEmbed kind="frame" src={youtubeEmbedUrl} widescreen />
```
