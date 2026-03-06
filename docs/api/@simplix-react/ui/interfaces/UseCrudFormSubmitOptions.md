[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitOptions

# Interface: UseCrudFormSubmitOptions\<T, TId\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L12)

Options for the [useCrudFormSubmit](../functions/useCrudFormSubmit.md) hook.

## Type Parameters

### T

`T`

### TId

`TId` = `unknown`

## Properties

### create

> **create**: [`CrudMutation`](CrudMutation.md)\<`T`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L16)

Create mutation hook result.

***

### entityId?

> `optional` **entityId**: `TId`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L14)

Entity ID for edit mode. When nullish, create mode is used.

***

### onSuccess()?

> `optional` **onSuccess**: () => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L20)

Called after a successful create or update.

#### Returns

`void`

***

### update?

> `optional` **update**: [`CrudMutation`](CrudMutation.md)\<\{ `dto`: `T`; `id`: `TId`; \}\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L18)

Update mutation hook result. Required for edit mode.
