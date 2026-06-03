[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitResult

# Interface: UseCrudFormSubmitResult\<T\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L78)

Return type of [useCrudFormSubmit](../functions/useCrudFormSubmit.md).

## Type Parameters

### T

`T`

## Properties

### fieldErrors

> **fieldErrors**: `Record`\<`string`, `string`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L86)

Server validation errors keyed by field name. Empty when no errors.

***

### handleSubmit()

> **handleSubmit**: (`values`) => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:82](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L82)

Submit handler that dispatches to create or update mutation.

#### Parameters

##### values

`T`

#### Returns

`void`

***

### isEdit

> **isEdit**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:80](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L80)

Whether the form is in edit mode (entity already exists).

***

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L84)

Whether the active mutation is pending.
