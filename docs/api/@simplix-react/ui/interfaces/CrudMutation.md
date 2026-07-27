[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudMutation

# Interface: CrudMutation\<TInput\>

Defined in: [packages/headless/dist/index.d.ts:125](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L125)

Minimal mutation shape consumed by form submit helpers on every platform.

## Type Parameters

### TInput

`TInput`

## Properties

### isPending

> **isPending**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:133](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L133)

Whether the mutation is currently in flight.

***

### mutate()

> **mutate**: (`input`, `options?`) => `void`

Defined in: [packages/headless/dist/index.d.ts:127](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L127)

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

Defined in: [packages/headless/dist/index.d.ts:131](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L131)

Promise-based mutation trigger for error handling.

#### Parameters

##### input

`TInput`

#### Returns

`Promise`\<`unknown`\>
