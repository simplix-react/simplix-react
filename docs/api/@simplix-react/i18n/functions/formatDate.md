[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / formatDate

# Function: formatDate()

> **formatDate**(`date`, `locale`, `timeZone`, `options?`): `string`

Defined in: [datetime.ts:189](https://github.com/simplix-react/simplix-react/blob/main/datetime.ts#L189)

Format a date according to locale conventions.

## Parameters

### date

[`DateInput`](../type-aliases/DateInput.md)

### locale

`string`

### timeZone

`string`

### options?

[`FormatDateOptions`](../interfaces/FormatDateOptions.md) = `{}`

## Returns

`string`

## Example

```ts
formatDate(new Date(), "ko", "Asia/Seoul", { preset: "short" }) // "2024. 12. 5."
```
