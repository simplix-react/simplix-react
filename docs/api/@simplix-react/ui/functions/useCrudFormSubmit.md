[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCrudFormSubmit

# Function: useCrudFormSubmit()

> **useCrudFormSubmit**\<`T`, `TId`\>(`options`): [`UseCrudFormSubmitResult`](../interfaces/UseCrudFormSubmitResult.md)\<`T`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:71](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L71)

Handles create/update mutation dispatch for CRUD forms.
Determines whether to create or update based on `entityId` presence.

Automatically extracts server validation errors (e.g. Spring Boot `errorDetail`)
and exposes them as `fieldErrors` for per-field error display.

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

## Remarks

Validation errors are suppressed from the global error dialog
(requires `MutationCache.onError` to skip `category === "validation"`).
Non-validation errors still propagate to the global dialog.

## Example

```tsx
const { isEdit, handleSubmit, fieldErrors } = useCrudFormSubmit<FormValues>({
  entityId,
  create: adaptOrvalCreate(_create, { onSettled: invalidate }),
  update: adaptOrvalUpdate(_update, "id", { onSettled: invalidate }),
  onSuccess,
});

<FormFields.TextField
  label={fieldLabel("name")}
  value={name}
  onChange={setName}
  error={fieldErrors["name"]}
/>
```
