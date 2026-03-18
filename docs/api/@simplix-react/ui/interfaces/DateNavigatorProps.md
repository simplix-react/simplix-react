[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DateNavigatorProps

# Interface: DateNavigatorProps

Defined in: [packages/ui/src/base/inputs/date-navigator.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-navigator.tsx#L8)

Props for the [DateNavigator](../functions/DateNavigator.md) component.

## Extends

- `Omit`\<[`DatePickerProps`](DatePickerProps.md), `"clearable"`\>

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:83](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L83)

Additional class name for the trigger button.

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`className`](DatePickerProps.md#classname)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:81](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L81)

Disable the picker.

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`disabled`](DatePickerProps.md#disabled)

***

### endYear?

> `optional` **endYear**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:71](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L71)

End year for the year dropdown.

#### Default Value

```ts
current year + 10
```

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`endYear`](DatePickerProps.md#endyear)

***

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L67)

Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). Defaults to current i18n language.

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`locale`](DatePickerProps.md#locale)

***

### maxDate?

> `optional` **maxDate**: `Date`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L77)

Latest selectable date.

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`maxDate`](DatePickerProps.md#maxdate)

***

### minDate?

> `optional` **minDate**: `Date`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L75)

Earliest selectable date.

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`minDate`](DatePickerProps.md#mindate)

***

### onChange()

> **onChange**: (`date`) => `void`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:63](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L63)

Called when the date changes.

#### Parameters

##### date

`Date` | `undefined`

#### Returns

`void`

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`onChange`](DatePickerProps.md#onchange)

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:65](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L65)

Placeholder text when no date is selected.

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`placeholder`](DatePickerProps.md#placeholder)

***

### reverseYears?

> `optional` **reverseYears**: `boolean`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:73](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L73)

Reverse year order in dropdown.

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`reverseYears`](DatePickerProps.md#reverseyears)

***

### size?

> `optional` **size**: `"default"` \| `"sm"`

Defined in: [packages/ui/src/base/inputs/date-navigator.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-navigator.tsx#L10)

Size variant.

#### Default Value

```ts
"default"
```

***

### startYear?

> `optional` **startYear**: `number`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:69](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L69)

Start year for the year dropdown.

#### Default Value

```ts
current year - 10
```

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`startYear`](DatePickerProps.md#startyear)

***

### value

> **value**: `Date` \| `undefined`

Defined in: [packages/ui/src/base/inputs/date-picker.tsx:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/date-picker.tsx#L61)

Currently selected date.

#### Inherited from

[`DatePickerProps`](DatePickerProps.md).[`value`](DatePickerProps.md#value)
