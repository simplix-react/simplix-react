[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / usePulseOnUpdate

# Function: usePulseOnUpdate()

> **usePulseOnUpdate**(`updatedAt`, `duration?`): `boolean`

Defined in: [packages/ui/src/hooks/use-pulse-on-update.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/hooks/use-pulse-on-update.ts#L19)

Returns `true` for a short window after `updatedAt` changes,
enabling a visual "pulse" effect on freshly updated items.

## Parameters

### updatedAt

A timestamp (epoch ms) that changes when the item is updated.
  `undefined` while the data is loading — no pulse fires.

`number` | `undefined`

### duration?

`number` = `600`

How long the pulse stays active, in milliseconds. Defaults to 600.

## Returns

`boolean`

`true` during the pulse window, `false` otherwise.

## Example

```tsx
const pulsing = usePulseOnUpdate(item.updatedAt);
return <div className={pulsing ? "animate-pulse" : ""}>...</div>;
```
