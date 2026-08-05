[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CurrencyOption

# Interface: CurrencyOption

Defined in: [packages/ui/src/utils/use-currency-options.ts:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/use-currency-options.ts#L5)

One currency an amount can be written in.

## Properties

### code

> **code**: `string`

Defined in: [packages/ui/src/utils/use-currency-options.ts:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/use-currency-options.ts#L7)

ISO 4217 code, e.g. "KRW".

***

### decimalPlaces

> **decimalPlaces**: `number`

Defined in: [packages/ui/src/utils/use-currency-options.ts:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/use-currency-options.ts#L17)

How many decimal places the currency implies — the won has none, the dinar has three.
Amounts are commonly stored as integers in the currency's smallest unit, and this is the
scale that turns such an integer back into a figure.

***

### englishName

> **englishName**: `string`

Defined in: [packages/ui/src/utils/use-currency-options.ts:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/use-currency-options.ts#L11)

The currency's English name, so a search in either language finds it.

***

### localName

> **localName**: `string`

Defined in: [packages/ui/src/utils/use-currency-options.ts:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/use-currency-options.ts#L9)

The currency's name in the reader's language, e.g. "대한민국 원".
