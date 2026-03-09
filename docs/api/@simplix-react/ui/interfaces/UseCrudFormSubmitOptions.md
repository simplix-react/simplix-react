[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitOptions

# Interface: UseCrudFormSubmitOptions\<T, TId\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L19)

Options for the [useCrudFormSubmit](../functions/useCrudFormSubmit.md) hook.

## Type Parameters

### T

`T`

### TId

`TId` = `unknown`

## Properties

### create

> **create**: [`CrudMutation`](CrudMutation.md)\<`T`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L23)

Create mutation hook result.

***

### entityId?

> `optional` **entityId**: `TId`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L21)

Entity ID for edit mode. When nullish, create mode is used.

***

### onSuccess()?

> `optional` **onSuccess**: () => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L27)

Called after a successful create or update.

#### Returns

`void`

***

### update?

> `optional` **update**: [`CrudMutation`](CrudMutation.md)\<\{ `dto`: `T`; `id`: `TId`; \}\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L25)

Update mutation hook result. Required for edit mode.
