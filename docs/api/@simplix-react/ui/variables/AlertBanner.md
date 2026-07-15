[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / AlertBanner

# Variable: AlertBanner

> `const` **AlertBanner**: `ForwardRefExoticComponent`\<`Omit`\<[`AlertBannerProps`](../interfaces/AlertBannerProps.md), `"ref"`\> & `RefAttributes`\<`HTMLDivElement`\>\>

Defined in: [packages/ui/src/base/feedback/alert-banner.tsx:110](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/feedback/alert-banner.tsx#L110)

Tinted status banner — the de-facto canonical alert pattern promoted into the
shared UI. Renders a rounded, tone-tinted surface with an optional leading
icon, a title/subtitle pair (or free-form `children`), and a trailing slot.

All display strings arrive pre-translated as props; the component never calls
`t()`. Color is driven entirely by [STATUS\_TONES](STATUS_TONES.md), so every surface and
icon class already carries its `dark:` variant.

## Example

```tsx
<AlertBanner
  tone="danger"
  icon={AlertTriangleIcon}
  title="Connection lost"
  subtitle="Reconnecting to the device gateway…"
  trailing={<Badge variant="destructive">Offline</Badge>}
/>
```
