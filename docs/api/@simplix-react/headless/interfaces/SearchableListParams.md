[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / SearchableListParams

# Interface: SearchableListParams

Defined in: [build-searchable-params.ts:8](https://github.com/simplix-react/simplix-react/blob/main/build-searchable-params.ts#L8)

List query params assembled by a list state machine before serialization —
the web page model (`useCrudList`) and the native feed model
(`useEntityFeed`) both produce this shape.

## Properties

### filters?

> `optional` **filters**: `Record`\<`string`, `unknown`\>

Defined in: [build-searchable-params.ts:10](https://github.com/simplix-react/simplix-react/blob/main/build-searchable-params.ts#L10)

Committed filter values keyed by `field.operator`; `_search` is dropped.

***

### pagination?

> `optional` **pagination**: `object`

Defined in: [build-searchable-params.ts:14](https://github.com/simplix-react/simplix-react/blob/main/build-searchable-params.ts#L14)

Offset pagination — `page` is 1-based here.

#### limit

> **limit**: `number`

#### page

> **page**: `number`

***

### sort?

> `optional` **sort**: [`SortState`](SortState.md)

Defined in: [build-searchable-params.ts:12](https://github.com/simplix-react/simplix-react/blob/main/build-searchable-params.ts#L12)

Active sort state.
