[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudMutation

# Interface: CrudMutation\<TInput\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L10)

Minimal mutation shape used by [useCrudFormSubmit](../functions/useCrudFormSubmit.md).

## Type Parameters

### TInput

`TInput`

## Properties

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L16)

Whether the mutation is currently in flight.

***

### mutate()

> **mutate**: (`input`, `options?`) => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L12)

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

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L14)

Promise-based mutation trigger for error handling.

#### Parameters

##### input

`TInput`

#### Returns

`Promise`\<`unknown`\>
