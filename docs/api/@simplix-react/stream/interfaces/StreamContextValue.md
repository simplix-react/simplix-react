[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/stream](../README.md) / StreamContextValue

# Interface: StreamContextValue

Defined in: [types.ts:35](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L35)

## Properties

### addEventListener()

> **addEventListener**: (`resource`, `callback`) => () => `void`

Defined in: [types.ts:41](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L41)

#### Parameters

##### resource

`string`

##### callback

(`data`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### connectionStatus

> **connectionStatus**: [`ConnectionStatus`](../type-aliases/ConnectionStatus.md)

Defined in: [types.ts:37](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L37)

***

### lastHeartbeat

> **lastHeartbeat**: `number`

Defined in: [types.ts:38](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L38)

***

### registerSubscription()

> **registerSubscription**: (`id`, `request`) => `void`

Defined in: [types.ts:39](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L39)

#### Parameters

##### id

`string`

##### request

[`SubscriptionRequest`](SubscriptionRequest.md)

#### Returns

`void`

***

### sessionId

> **sessionId**: `string` \| `null`

Defined in: [types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L36)

***

### unregisterSubscription()

> **unregisterSubscription**: (`id`) => `void`

Defined in: [types.ts:40](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L40)

#### Parameters

##### id

`string`

#### Returns

`void`
