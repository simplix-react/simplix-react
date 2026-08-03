[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / currencyDecimalPlaces

# Function: currencyDecimalPlaces()

> **currencyDecimalPlaces**(`code`): `number`

Defined in: [packages/ui/src/utils/use-currency-options.ts:46](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/use-currency-options.ts#L46)

How many decimal places a currency implies.

<p>Asked of the formatter, which is where the ISO 4217 minor-unit table already lives. A
code the runtime does not recognize is treated as two, which is what the standard says for
anything unlisted.

## Parameters

### code

`string`

the ISO 4217 code

## Returns

`number`

the number of decimal places
