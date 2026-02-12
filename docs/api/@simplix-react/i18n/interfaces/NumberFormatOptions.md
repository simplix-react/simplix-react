[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / NumberFormatOptions

# Interface: NumberFormatOptions

Defined in: [types.ts:106](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/i18n/src/types.ts#L106)

Configures number formatting options passed to `Intl.NumberFormat`.

## Properties

### currency?

> `optional` **currency**: `string`

Defined in: [types.ts:110](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/i18n/src/types.ts#L110)

ISO 4217 currency code (required when `style` is `"currency"`).

***

### maximumFractionDigits?

> `optional` **maximumFractionDigits**: `number`

Defined in: [types.ts:116](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/i18n/src/types.ts#L116)

Maximum number of fraction digits to display.

***

### minimumFractionDigits?

> `optional` **minimumFractionDigits**: `number`

Defined in: [types.ts:114](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/i18n/src/types.ts#L114)

Minimum number of fraction digits to display.

***

### style?

> `optional` **style**: [`NumberFormatStyle`](../type-aliases/NumberFormatStyle.md)

Defined in: [types.ts:108](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/i18n/src/types.ts#L108)

The number formatting style.

***

### unit?

> `optional` **unit**: `string`

Defined in: [types.ts:112](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/i18n/src/types.ts#L112)

Unit identifier (required when `style` is `"unit"`).
