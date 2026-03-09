[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / AdaptOrvalListOptions

# Interface: AdaptOrvalListOptions

Defined in: [packages/ui/src/crud/list/adapt-orval-list.ts:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/adapt-orval-list.ts#L22)

## Properties

### queryOptions?

> `optional` **queryOptions**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/adapt-orval-list.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/adapt-orval-list.ts#L25)

Extra query options forwarded to Orval's second argument (`{ query: {...} }`).
 Merged with defaults (`staleTime: 0, gcTime: 0`).

***

### transformFilters()?

> `optional` **transformFilters**: (`filters`) => `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/list/adapt-orval-list.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/adapt-orval-list.ts#L29)

Transform filter key-value pairs before sending to the API.
 Use this to convert generic filter formats to backend-specific formats
 (e.g., searchable-jpa BETWEEN operator, date format conversion).

#### Parameters

##### filters

`Record`\<`string`, `unknown`\>

#### Returns

`Record`\<`string`, `unknown`\>
