[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudFormSubmit

# Function: useCrudFormSubmit()

> **useCrudFormSubmit**\<`T`, `TId`\>(`options`): [`UseCrudFormSubmitResult`](../interfaces/UseCrudFormSubmitResult.md)\<`T`\>

Defined in: packages/ui/src/crud/form/use-crud-form-submit.ts:40

Handles create/update mutation dispatch for CRUD forms.
Determines whether to create or update based on `entityId` presence.

## Type Parameters

### T

`T`

### TId

`TId` = `unknown`

## Parameters

### options

[`UseCrudFormSubmitOptions`](../interfaces/UseCrudFormSubmitOptions.md)\<`T`, `TId`\>

## Returns

[`UseCrudFormSubmitResult`](../interfaces/UseCrudFormSubmitResult.md)\<`T`\>

## Example

```tsx
const create = entityHooks.useCreate() as any;
const update = entityHooks.useUpdate() as any;
const { isEdit, handleSubmit } = useCrudFormSubmit<FormValues>({
  entityId,
  create,
  update,
  onSuccess,
});
```
