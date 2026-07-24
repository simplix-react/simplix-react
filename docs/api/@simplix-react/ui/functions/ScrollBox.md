[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ScrollBox

# Function: ScrollBox()

> **ScrollBox**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/display/scroll-box.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/scroll-box.tsx#L25)

Bounded scroll container for long read-through content (agreement bodies,
terms, logs): a bordered box that scrolls its own overflow instead of
stretching the page. Centralizes the max-height + overflow pattern so
call sites stop re-implementing it with raw divs.

## Parameters

### \_\_namedParameters

[`ScrollBoxProps`](../interfaces/ScrollBoxProps.md)

## Returns

`Element`

## Example

```tsx
<ScrollBox maxHeight={320}>{agreement.content}</ScrollBox>
```
