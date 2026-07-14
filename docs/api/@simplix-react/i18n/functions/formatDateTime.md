[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / formatDateTime

# Function: formatDateTime()

> **formatDateTime**(`date`, `locale`, `timeZone`, `options?`): `string`

Defined in: [datetime.ts:242](https://github.com/simplix-react/simplix-react/blob/main/datetime.ts#L242)

Format date and time together according to locale conventions.

## Parameters

### date

[`DateInput`](../type-aliases/DateInput.md)

### locale

`string`

### timeZone

`string`

### options?

[`FormatDateTimeOptions`](../interfaces/FormatDateTimeOptions.md) = `{}`

## Returns

`string`

## Example

```ts
formatDateTime(new Date(), "ko", "Asia/Seoul", { preset: "short" }) // "2024. 12. 5. 14:30"
```
