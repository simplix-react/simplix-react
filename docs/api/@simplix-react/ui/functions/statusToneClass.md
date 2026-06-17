[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / statusToneClass

# Function: statusToneClass()

> **statusToneClass**(`tone`, `slot`): `string`

Defined in: [packages/ui/src/base/status-tone.ts:165](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/status-tone.ts#L165)

Resolve a single slot's Tailwind class string for a tone.

## Parameters

### tone

[`StatusTone`](../type-aliases/StatusTone.md)

Semantic status tone.

### slot

keyof [`StatusToneToken`](../interfaces/StatusToneToken.md)

Which slot of the tone token to read (e.g. `badge`, `dot`, `surface`).

## Returns

`string`

The Tailwind class string (carrying its own `dark:` variant) for that tone/slot.

## Example

```tsx
<span className={statusToneClass("success", "badge")}>Active</span>
```
