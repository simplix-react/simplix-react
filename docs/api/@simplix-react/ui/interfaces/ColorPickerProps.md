[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ColorPickerProps

# Interface: ColorPickerProps

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L52)

Props for the [ColorPicker](../functions/ColorPicker.md) component.

## Properties

### aria-label?

> `optional` **aria-label**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:66](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L66)

Accessible label for the trigger button.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:68](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L68)

Additional class names for the trigger button.

***

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:62](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L62)

Allow clearing the selected color.

#### Default Value

```ts
true
```

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:64](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L64)

Disable the picker.

***

### lang?

> `optional` **lang**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L76)

BCP-47 language code for picker UI text (e.g. `"ko"`, `"en"`, `"ja"`).
When omitted, follows the active i18n locale from useLocale (re-renders
on locale change). Bundled languages: ko/en/ja — unknown codes fall back to English.

***

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:56](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L56)

Called when the value changes.

#### Parameters

##### value

`string`

#### Returns

`void`

***

### presetColors?

> `optional` **presetColors**: [`PresetColor`](PresetColor.md)[]

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L58)

Preset color palette. Defaults to 16 common colors.

***

### renderClear()?

> `optional` **renderClear**: (`onClear`) => `ReactNode`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:70](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L70)

Render a custom clear button. Falls back to a built-in ghost button.

#### Parameters

##### onClear

() => `void`

#### Returns

`ReactNode`

***

### showCustomPicker?

> `optional` **showCustomPicker**: `boolean`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L60)

Show the native color picker for custom colors.

#### Default Value

```ts
true
```

***

### value

> **value**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:54](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L54)

Current hex color value (e.g. `"#ff0000"`).
