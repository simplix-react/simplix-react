[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / CrudMutation

# Interface: CrudMutation\<TInput\>

Defined in: [crud-mutation.ts:2](https://github.com/simplix-react/simplix-react/blob/main/crud-mutation.ts#L2)

Minimal mutation shape consumed by form submit helpers on every platform.

## Type Parameters

### TInput

`TInput`

## Properties

### isPending

> **isPending**: `boolean`

Defined in: [crud-mutation.ts:8](https://github.com/simplix-react/simplix-react/blob/main/crud-mutation.ts#L8)

Whether the mutation is currently in flight.

***

### mutate()

> **mutate**: (`input`, `options?`) => `void`

Defined in: [crud-mutation.ts:4](https://github.com/simplix-react/simplix-react/blob/main/crud-mutation.ts#L4)

Trigger the mutation with the given input.

#### Parameters

##### input

`TInput`

##### options?

###### onSuccess?

() => `void`

#### Returns

`void`

***

### mutateAsync()

> **mutateAsync**: (`input`) => `Promise`\<`unknown`\>

Defined in: [crud-mutation.ts:6](https://github.com/simplix-react/simplix-react/blob/main/crud-mutation.ts#L6)

Promise-based mutation trigger for error handling.

#### Parameters

##### input

`TInput`

#### Returns

`Promise`\<`unknown`\>
