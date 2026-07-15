[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / NumberInput

# Variable: NumberInput

> `const` **NumberInput**: `ForwardRefExoticComponent`\<`Omit`\<[`NumberInputProps`](../interfaces/NumberInputProps.md), `"ref"`\> & `RefAttributes`\<`HTMLInputElement`\>\>

Defined in: [packages/ui/src/base/inputs/number-input.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/number-input.tsx#L20)

Numeric input with always-visible spinner buttons.

## Remarks

The native browser spinners (which only appear on hover/focus and differ
across browsers) are hidden and replaced with the same spinner buttons the
time picker uses. Keyboard stepping (ArrowUp/ArrowDown) still works.
