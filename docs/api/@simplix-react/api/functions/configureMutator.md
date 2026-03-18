[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / configureMutator

# Function: configureMutator()

## Call Signature

> **configureMutator**(`fetch`): `void`

Defined in: [packages/api/src/index.ts:107](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L107)

Register a fetch function for Orval-generated API clients.

### Parameters

#### fetch

[`OrvalMutator`](../type-aliases/OrvalMutator.md)

### Returns

`void`

### Remarks

Supports named strategies for multi-backend setups.
When called with a single argument, registers under the `"default"` strategy.

### Example

```ts
// Default strategy
configureMutator(myFetcher);

// Named strategy for multi-backend
configureMutator("admin", adminFetcher);
```

## Call Signature

> **configureMutator**(`strategy`, `fetch`): `void`

Defined in: [packages/api/src/index.ts:108](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L108)

Register a fetch function for Orval-generated API clients.

### Parameters

#### strategy

`string`

#### fetch

[`OrvalMutator`](../type-aliases/OrvalMutator.md)

### Returns

`void`

### Remarks

Supports named strategies for multi-backend setups.
When called with a single argument, registers under the `"default"` strategy.

### Example

```ts
// Default strategy
configureMutator(myFetcher);

// Named strategy for multi-backend
configureMutator("admin", adminFetcher);
```
