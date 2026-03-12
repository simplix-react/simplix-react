[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/stream](../README.md) / StreamProtocol

# Interface: StreamProtocol

Defined in: [types.ts:75](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L75)

Protocol adapter that decouples the framework from a specific SSE envelope format.
All functions receive the raw MessageEvent.data string.
If omitted, the default simplix-stream envelope format is used.

## Properties

### parseConnected()?

> `optional` **parseConnected**: (`data`) => [`ParsedConnectedEvent`](ParsedConnectedEvent.md)

Defined in: [types.ts:76](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L76)

#### Parameters

##### data

`string`

#### Returns

[`ParsedConnectedEvent`](ParsedConnectedEvent.md)

***

### parseData()?

> `optional` **parseData**: (`data`) => [`ParsedDataEvent`](ParsedDataEvent.md)

Defined in: [types.ts:77](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L77)

#### Parameters

##### data

`string`

#### Returns

[`ParsedDataEvent`](ParsedDataEvent.md)

***

### parseGap()?

> `optional` **parseGap**: (`data`) => [`ParsedGapEvent`](ParsedGapEvent.md)

Defined in: [types.ts:78](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L78)

#### Parameters

##### data

`string`

#### Returns

[`ParsedGapEvent`](ParsedGapEvent.md)
