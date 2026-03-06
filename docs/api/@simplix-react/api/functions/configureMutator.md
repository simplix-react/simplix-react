[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / configureMutator

# Function: configureMutator()

## Call Signature

> **configureMutator**(`fetch`): `void`

Defined in: [packages/api/src/index.ts:66](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L66)

Register a fetch function for Orval-generated API clients.

### Parameters

#### fetch

[`OrvalMutator`](../type-aliases/OrvalMutator.md)

The fetch function (only when the first argument is a strategy name).

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

Defined in: [packages/api/src/index.ts:67](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L67)

Register a fetch function for Orval-generated API clients.

### Parameters

#### strategy

`string`

#### fetch

[`OrvalMutator`](../type-aliases/OrvalMutator.md)

The fetch function (only when the first argument is a strategy name).

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
