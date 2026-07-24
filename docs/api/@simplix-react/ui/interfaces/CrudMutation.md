[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudMutation

# Interface: CrudMutation\<TInput\>

Defined in: [packages/headless/dist/index.d.ts:46](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L46)

Minimal mutation shape consumed by form submit helpers on every platform.

## Type Parameters

### TInput

`TInput`

## Properties

### isPending

> **isPending**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:54](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L54)

Whether the mutation is currently in flight.

***

### mutate()

> **mutate**: (`input`, `options?`) => `void`

Defined in: [packages/headless/dist/index.d.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L48)

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

Defined in: [packages/headless/dist/index.d.ts:52](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L52)

Promise-based mutation trigger for error handling.

#### Parameters

##### input

`TInput`

#### Returns

`Promise`\<`unknown`\>
