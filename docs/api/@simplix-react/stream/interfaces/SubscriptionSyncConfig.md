[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/stream](../README.md) / SubscriptionSyncConfig

# Interface: SubscriptionSyncConfig

Defined in: [types.ts:86](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L86)

Subscription sync configuration.
Tells the provider how to sync active subscriptions to the server.
Set to `false` on StreamProvider to disable sync entirely.

## Properties

### body()?

> `optional` **body**: (`subscriptions`) => `unknown`

Defined in: [types.ts:92](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L92)

Build the request body. Default: `{ subscriptions }`

#### Parameters

##### subscriptions

[`SubscriptionRequest`](SubscriptionRequest.md)[]

#### Returns

`unknown`

***

### method?

> `optional` **method**: `string`

Defined in: [types.ts:90](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L90)

HTTP method. Default: "PUT"

***

### url()

> **url**: (`sessionId`) => `string`

Defined in: [types.ts:88](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L88)

Build the URL for subscription sync. Receives the session ID.

#### Parameters

##### sessionId

`string`

#### Returns

`string`
