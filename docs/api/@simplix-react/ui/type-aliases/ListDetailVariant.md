[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetailVariant

# Type Alias: ListDetailVariant

> **ListDetailVariant** = `"panel"` \| `"dialog"` \| `"drawer"`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L30)

How the detail appears.

<p>`"panel"` beside the list, `"drawer"` slid in from the right edge over the full height,
`"dialog"` as a centred modal. The first two are the same screen said two ways and an
installation picks between them through `UIProvider`'s `detailPresentation`; the third is a
screen's own decision, because a centred modal claims the record is an interruption rather than
the thing being worked on.
