[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitResult

# Interface: UseCrudFormSubmitResult\<T\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L31)

Return type of [useCrudFormSubmit](../functions/useCrudFormSubmit.md).

## Type Parameters

### T

`T`

## Properties

### fieldErrors

> **fieldErrors**: `Record`\<`string`, `string`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L39)

Server validation errors keyed by field name. Empty when no errors.

***

### handleSubmit()

> **handleSubmit**: (`values`) => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L35)

Submit handler that dispatches to create or update mutation.

#### Parameters

##### values

`T`

#### Returns

`void`

***

### isEdit

> **isEdit**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L33)

Whether the form is in edit mode (entity already exists).

***

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:37](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L37)

Whether the active mutation is pending.
