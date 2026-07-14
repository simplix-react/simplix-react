[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / StatusBadge

# Variable: StatusBadge

> `const` **StatusBadge**: `ForwardRefExoticComponent`\<`Omit`\<[`StatusBadgeProps`](../interfaces/StatusBadgeProps.md), `"ref"`\> & `RefAttributes`\<`HTMLSpanElement`\>\>

Defined in: [packages/ui/src/base/display/status-badge.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/status-badge.tsx#L48)

Compact status pill combining a tone-colored label with an optional leading
dot or icon.

`appearance="filled"` uses the tone's soft filled background; `outline` draws
a tone-colored border over a transparent background. A leading icon adopts the
tone's standalone icon color in outline mode; a leading dot mirrors the tone
(and pulses when `pulse` is set).

## Example

```tsx
<StatusBadge tone="success" label="Active" showDot />
<StatusBadge tone="danger" label="Failed" appearance="filled" />
```
