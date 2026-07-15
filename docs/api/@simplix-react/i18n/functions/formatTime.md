[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / formatTime

# Function: formatTime()

> **formatTime**(`date`, `locale`, `timeZone`, `options?`): `string`

Defined in: [datetime.ts:213](https://github.com/simplix-react/simplix-react/blob/main/datetime.ts#L213)

Format a time according to locale conventions.

## Parameters

### date

[`DateInput`](../type-aliases/DateInput.md)

### locale

`string`

### timeZone

`string`

### options?

[`FormatTimeOptions`](../interfaces/FormatTimeOptions.md) = `{}`

## Returns

`string`

## Example

```ts
formatTime(new Date(), "ko", "Asia/Seoul", { preset: "short" }) // "14:30"
```
