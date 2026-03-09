[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ColorPickerProps

# Interface: ColorPickerProps

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L37)

Props for the [ColorPicker](../functions/ColorPicker.md) component.

## Properties

### aria-label?

> `optional` **aria-label**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L51)

Accessible label for the trigger button.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:53](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L53)

Additional class names for the trigger button.

***

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:47](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L47)

Allow clearing the selected color.

#### Default Value

```ts
true
```

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L49)

Disable the picker.

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L41)

Called when the value changes.

#### Parameters

##### value

`string`

#### Returns

`void`

***

### presetColors?

> `optional` **presetColors**: [`PresetColor`](PresetColor.md)[]

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L43)

Preset color palette. Defaults to 16 common colors.

***

### renderClear()?

> `optional` **renderClear**: (`onClear`) => `ReactNode`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:55](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L55)

Render a custom clear button. Falls back to a built-in ghost button.

#### Parameters

##### onClear

() => `void`

#### Returns

`ReactNode`

***

### showCustomPicker?

> `optional` **showCustomPicker**: `boolean`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:45](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L45)

Show the native color picker for custom colors.

#### Default Value

```ts
true
```

***

### value

> **value**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L39)

Current hex color value (e.g. `"#ff0000"`).
