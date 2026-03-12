[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/stream](../README.md) / useStreamSubscription

# Function: useStreamSubscription()

> **useStreamSubscription**\<`T`\>(`resource`, `options?`): `T` \| `null`

Defined in: [use-stream-subscription.ts:30](https://github.com/simplix-react/simplix-react/blob/main/use-stream-subscription.ts#L30)

Subscribe to a SSE resource and receive data updates.

Registers a subscription in the global registry on mount and
unregisters on unmount. The registry syncs the full subscription
set to the server via a single PUT call (debounced).

## Type Parameters

### T

`T` = `unknown`

## Parameters

### resource

`string`

The resource name to listen for (e.g., "middleware-health")

### options?

`StreamSubscriptionOptions`

Subscription options

## Returns

`T` \| `null`

The latest data received from the stream
