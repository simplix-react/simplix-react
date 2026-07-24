[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / BuildSearchableParamsOptions

# Interface: BuildSearchableParamsOptions

Defined in: [build-searchable-params.ts:18](https://github.com/simplix-react/simplix-react/blob/main/build-searchable-params.ts#L18)

Options for [buildSearchableParams](../functions/buildSearchableParams.md).

## Properties

### transformFilters()?

> `optional` **transformFilters**: (`filters`) => `Record`\<`string`, `unknown`\>

Defined in: [build-searchable-params.ts:22](https://github.com/simplix-react/simplix-react/blob/main/build-searchable-params.ts#L22)

Transform filter key-value pairs before sending to the API.
 Use this to convert generic filter formats to backend-specific formats
 (e.g., searchable-jpa BETWEEN operator, date format conversion).

#### Parameters

##### filters

`Record`\<`string`, `unknown`\>

#### Returns

`Record`\<`string`, `unknown`\>
