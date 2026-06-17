[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / StatusDot

# Variable: StatusDot

> `const` **StatusDot**: `ForwardRefExoticComponent`\<`Omit`\<[`StatusDotProps`](../interfaces/StatusDotProps.md), `"ref"`\> & `RefAttributes`\<`HTMLSpanElement`\>\>

Defined in: [packages/ui/src/base/display/status-dot.tsx:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/status-dot.tsx#L46)

Small status indicator dot with an optional animated ring.

Renders a solid tone-colored dot (or custom `children`) inside a relatively
positioned wrapper. When `animation` is `ping`/`flash` and `active`, an
absolutely positioned ring layer pulses behind the foreground. When `active`
is `false`, the dot collapses to the neutral tone and no ring is shown.

## Example

```tsx
<StatusDot tone="success" />
<StatusDot tone="processing" animation="ping" label="Syncing" />
```
