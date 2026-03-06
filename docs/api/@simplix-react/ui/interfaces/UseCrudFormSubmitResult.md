[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitResult

# Interface: UseCrudFormSubmitResult\<T\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L24)

Return type of [useCrudFormSubmit](../functions/useCrudFormSubmit.md).

## Type Parameters

### T

`T`

## Properties

### handleSubmit()

> **handleSubmit**: (`values`) => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L28)

Submit handler that dispatches to create or update mutation.

#### Parameters

##### values

`T`

#### Returns

`void`

***

### isEdit

> **isEdit**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L26)

Whether the form is in edit mode (entity already exists).

***

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L30)

Whether the active mutation is pending.
