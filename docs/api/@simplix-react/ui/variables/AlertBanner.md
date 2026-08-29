[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / AlertBanner

# Variable: AlertBanner

> `const` **AlertBanner**: `ForwardRefExoticComponent`\<`Omit`\<[`AlertBannerProps`](../interfaces/AlertBannerProps.md), `"ref"`\> & `RefAttributes`\<`HTMLDivElement`\>\>

Defined in: [packages/ui/src/base/feedback/alert-banner.tsx:175](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/feedback/alert-banner.tsx#L175)

Tinted status banner — the de-facto canonical alert pattern promoted into the
shared UI. Renders a rounded, tone-tinted surface with a leading icon, a
title/subtitle pair (or free-form `children`), and a trailing slot.

All display strings arrive pre-translated as props; the component never calls
`t()`. Color is driven entirely by [STATUS\_TONES](STATUS_TONES.md), so every surface and
icon class already carries its `dark:` variant.

<p><b>The glyph comes from the tone.</b> A banner names its tone and gets the shape that goes
with it (TONE\_GLYPH); `icon` is for the caller who wants the subject drawn instead of
the severity, and `neutral` is the tone that carries no glyph because it carries no tint.

## Example

```tsx
// The triangle comes from the tone; nothing here has to remember it.
<AlertBanner
  tone="danger"
  title="Connection lost"
  subtitle="Reconnecting to the device gateway…"
  trailing={<Badge variant="destructive">Offline</Badge>}
/>

// A subject glyph, where the severity is not the thing worth drawing.
<AlertBanner tone="info" icon={KeyRoundIcon} title="Signing key rotates on 1 March" />
```
