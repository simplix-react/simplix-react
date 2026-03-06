[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useKeyboardNav

# Function: useKeyboardNav()

> **useKeyboardNav**(`options`): `object`

Defined in: [packages/ui/src/crud/list/use-keyboard-nav.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-keyboard-nav.ts#L30)

Keyboard navigation hook for list components.

## Parameters

### options

[`UseKeyboardNavOptions`](../interfaces/UseKeyboardNavOptions.md)

[UseKeyboardNavOptions](../interfaces/UseKeyboardNavOptions.md)

## Returns

`object`

Object containing a `containerRef` to attach to the list container element.

### containerRef

> **containerRef**: `RefObject`\<`HTMLElement` \| `null`\>

## Remarks

Bindings: ArrowUp/Down (navigate), Enter (select), Space (toggle),
Ctrl+K / Cmd+K (search), Escape (dismiss).
Attach the returned `containerRef` to the element that should capture keyboard events.
