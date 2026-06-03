[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / PresetColor

# Interface: PresetColor

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L20)

A preset color entry for the color picker palette.

## Properties

### key?

> `optional` **key**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L27)

Locale key for the color name (e.g. `"red"`). When provided the localized name
is resolved via the active locale; otherwise [PresetColor.name](#name) is shown.

***

### name

> **name**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L29)

Fallback name when [PresetColor.key](#key) is absent or unresolved.

***

### value

> **value**: `string`

Defined in: [packages/ui/src/base/inputs/color-picker.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/color-picker.tsx#L22)

Hex color value (e.g. `"#EF4444"`).
