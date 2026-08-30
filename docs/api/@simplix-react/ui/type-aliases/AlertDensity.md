[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / AlertDensity

# Type Alias: AlertDensity

> **AlertDensity** = `"default"` \| `"sm"` \| `"hint"`

Defined in: [packages/ui/src/base/feedback/alert-banner.tsx:32](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/feedback/alert-banner.tsx#L32)

Visual density of [AlertBanner](../variables/AlertBanner.md).

- `default` — comfortable padding, `size-5` icon.
- `sm` — tighter padding, `size-4` icon.

<p>Both carry the same type scale: a `text-sm font-medium` title over a `text-xs` muted
subtitle. The density decides the room, never the size of the words.
- `hint` — compact, borderless, `size-3.5` icon, `text-xs` body.
