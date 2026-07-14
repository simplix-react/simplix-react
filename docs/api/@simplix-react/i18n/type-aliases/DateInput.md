[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / DateInput

# Type Alias: DateInput

> **DateInput** = `Date` \| `string` \| `number`

Defined in: [datetime.ts:13](https://github.com/simplix-react/simplix-react/blob/main/datetime.ts#L13)

DateTime Internationalization Utilities

Provides locale-aware date/time formatting using the browser's Intl API.
- Date FORMAT is determined by locale (country conventions)
- Time DISPLAY respects the user's timezone setting

Host-agnostic: the consumer supplies `locale` and `timeZone`; see the
`DateTimeProvider` (`./react`) for the React binding that injects them.
