[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / CreateFormReturn

# Interface: CreateFormReturn

Defined in: [types.ts:78](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L78)

Return value of the `useCreateForm` hook.

## Example

```ts
const { form, isSubmitting, submitError, reset } = formHooks.task.useCreateForm();

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
    <form.Field name="title">
      {(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
    </form.Field>
    <button type="submit" disabled={isSubmitting}>Create</button>
    {submitError && <p>{submitError.message}</p>}
  </form>
);
```

## Properties

### form

> **form**: `AnyFormApi`

Defined in: [types.ts:80](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L80)

TanStack Form API instance for field binding and submission.

***

### isSubmitting

> **isSubmitting**: `boolean`

Defined in: [types.ts:82](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L82)

Whether the create mutation is currently in flight.

***

### reset()

> **reset**: () => `void`

Defined in: [types.ts:86](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L86)

Resets the form fields and clears the submission error.

#### Returns

`void`

***

### submitError

> **submitError**: `Error` \| `null`

Defined in: [types.ts:84](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L84)

The most recent submission error, or `null` if the last attempt succeeded.
