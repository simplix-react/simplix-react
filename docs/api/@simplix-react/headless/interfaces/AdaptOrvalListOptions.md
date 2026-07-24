[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / AdaptOrvalListOptions

# Interface: AdaptOrvalListOptions

Defined in: [adapt-orval-list.ts:23](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-list.ts#L23)

## Properties

### queryOptions?

> `optional` **queryOptions**: `Record`\<`string`, `unknown`\>

Defined in: [adapt-orval-list.ts:26](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-list.ts#L26)

Extra query options forwarded to Orval's second argument (`{ query: {...} }`).
 Merged with defaults (`staleTime: 0, gcTime: 0`).

***

### transformFilters()?

> `optional` **transformFilters**: (`filters`) => `Record`\<`string`, `unknown`\>

Defined in: [adapt-orval-list.ts:30](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-list.ts#L30)

Transform filter key-value pairs before sending to the API.
 Use this to convert generic filter formats to backend-specific formats
 (e.g., searchable-jpa BETWEEN operator, date format conversion).

#### Parameters

##### filters

`Record`\<`string`, `unknown`\>

#### Returns

`Record`\<`string`, `unknown`\>
