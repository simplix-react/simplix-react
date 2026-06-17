[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / SettingSwitchProps

# Interface: SettingSwitchProps

Defined in: [packages/ui/src/base/controls/setting-switch.tsx:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/setting-switch.tsx#L6)

## Properties

### checked

> **checked**: `boolean`

Defined in: [packages/ui/src/base/controls/setting-switch.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/setting-switch.tsx#L12)

Current toggle state.

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/base/controls/setting-switch.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/setting-switch.tsx#L10)

Optional helper text below the label. Already translated by the caller.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/controls/setting-switch.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/setting-switch.tsx#L16)

Disables the switch when true.

***

### id?

> `optional` **id**: `string`

Defined in: [packages/ui/src/base/controls/setting-switch.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/setting-switch.tsx#L18)

Explicit control id; an auto-generated id is used when omitted.

***

### label

> **label**: `string`

Defined in: [packages/ui/src/base/controls/setting-switch.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/setting-switch.tsx#L8)

Label text rendered on the left. Already translated by the caller.

***

### onCheckedChange()

> **onCheckedChange**: (`checked`) => `void`

Defined in: [packages/ui/src/base/controls/setting-switch.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/setting-switch.tsx#L14)

Fired with the next state when the user toggles the switch.

#### Parameters

##### checked

`boolean`

#### Returns

`void`
