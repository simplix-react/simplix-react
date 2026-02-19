[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitOptions

# Interface: UseCrudFormSubmitOptions\<T, TId\>

Defined in: packages/ui/src/crud/form/use-crud-form-submit.ts:10

Options for the [useCrudFormSubmit](../functions/useCrudFormSubmit.md) hook.

## Type Parameters

### T

`T`

### TId

`TId` = `unknown`

## Properties

### create

> **create**: [`CrudMutation`](CrudMutation.md)\<`T`\>

Defined in: packages/ui/src/crud/form/use-crud-form-submit.ts:12

***

### entityId?

> `optional` **entityId**: `TId`

Defined in: packages/ui/src/crud/form/use-crud-form-submit.ts:11

***

### onSuccess()?

> `optional` **onSuccess**: () => `void`

Defined in: packages/ui/src/crud/form/use-crud-form-submit.ts:14

#### Returns

`void`

***

### update?

> `optional` **update**: [`CrudMutation`](CrudMutation.md)\<\{ `dto`: `T`; `id`: `TId`; \}\>

Defined in: packages/ui/src/crud/form/use-crud-form-submit.ts:13
