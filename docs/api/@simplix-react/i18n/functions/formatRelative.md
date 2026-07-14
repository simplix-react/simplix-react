[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / formatRelative

# Function: formatRelative()

> **formatRelative**(`date`, `locale`, `baseDate?`): `string`

Defined in: [datetime.ts:291](https://github.com/simplix-react/simplix-react/blob/main/datetime.ts#L291)

Format relative time (e.g., "3 minutes ago", "yesterday", "in 2 hours").

## Parameters

### date

[`DateInput`](../type-aliases/DateInput.md)

### locale

`string`

### baseDate?

`Date` = `...`

## Returns

`string`

## Example

```ts
formatRelative(new Date(Date.now() - 3 * 60 * 1000), "ko") // "3분 전"
```
