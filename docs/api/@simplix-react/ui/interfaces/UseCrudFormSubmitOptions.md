[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitOptions

# Interface: UseCrudFormSubmitOptions\<T, TId\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:10](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/form/use-crud-form-submit.ts#L10)

Options for the [useCrudFormSubmit](../functions/useCrudFormSubmit.md) hook.

## Type Parameters

### T

`T`

### TId

`TId` = `unknown`

## Properties

### create

> **create**: [`CrudMutation`](CrudMutation.md)\<`T`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:12](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/form/use-crud-form-submit.ts#L12)

***

### entityId?

> `optional` **entityId**: `TId`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:11](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/form/use-crud-form-submit.ts#L11)

***

### onSuccess()?

> `optional` **onSuccess**: () => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:14](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/form/use-crud-form-submit.ts#L14)

#### Returns

`void`

***

### update?

> `optional` **update**: [`CrudMutation`](CrudMutation.md)\<\{ `dto`: `T`; `id`: `TId`; \}\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:13](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/form/use-crud-form-submit.ts#L13)
