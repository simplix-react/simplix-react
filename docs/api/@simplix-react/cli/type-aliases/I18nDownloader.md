[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / I18nDownloader

# Type Alias: I18nDownloader()

> **I18nDownloader** = (`serverOrigin`, `entities`, `locales`) => `Promise`\<`Map`\<`string`, `Record`\<`string`, `unknown`\>\> \| `undefined`\>

Defined in: [openapi/orchestration/spec-profile.ts:16](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L16)

Callback that downloads and transforms i18n data from a server.
Returns a Map of locale → domain-scoped JSON data to overlay.

## Parameters

### serverOrigin

`string`

### entities

[`I18nEntityInfo`](../interfaces/I18nEntityInfo.md)[]

### locales

`string`[]

## Returns

`Promise`\<`Map`\<`string`, `Record`\<`string`, `unknown`\>\> \| `undefined`\>
