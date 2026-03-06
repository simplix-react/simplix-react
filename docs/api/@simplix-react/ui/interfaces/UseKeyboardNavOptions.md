[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseKeyboardNavOptions

# Interface: UseKeyboardNavOptions

Defined in: [packages/ui/src/crud/list/use-keyboard-nav.ts:4](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-keyboard-nav.ts#L4)

Options for the [useKeyboardNav](../functions/useKeyboardNav.md) hook.

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [packages/ui/src/crud/list/use-keyboard-nav.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-keyboard-nav.ts#L16)

Enable or disable keyboard listeners. Defaults to `true`.

***

### onEscape()?

> `optional` **onEscape**: () => `void`

Defined in: [packages/ui/src/crud/list/use-keyboard-nav.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-keyboard-nav.ts#L14)

Called on Escape key press.

#### Returns

`void`

***

### onNavigate()

> **onNavigate**: (`direction`) => `void`

Defined in: [packages/ui/src/crud/list/use-keyboard-nav.ts:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-keyboard-nav.ts#L6)

Called on ArrowUp/ArrowDown key press.

#### Parameters

##### direction

`"up"` | `"down"`

#### Returns

`void`

***

### onSearch()

> **onSearch**: () => `void`

Defined in: [packages/ui/src/crud/list/use-keyboard-nav.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-keyboard-nav.ts#L12)

Called on Ctrl+K / Cmd+K key press.

#### Returns

`void`

***

### onSelect()

> **onSelect**: () => `void`

Defined in: [packages/ui/src/crud/list/use-keyboard-nav.ts:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-keyboard-nav.ts#L8)

Called on Enter key press.

#### Returns

`void`

***

### onToggle()

> **onToggle**: () => `void`

Defined in: [packages/ui/src/crud/list/use-keyboard-nav.ts:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-keyboard-nav.ts#L10)

Called on Space key press (skipped inside input/textarea/button).

#### Returns

`void`
