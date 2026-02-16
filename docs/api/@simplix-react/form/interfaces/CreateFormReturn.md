[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / CreateFormReturn

# Interface: CreateFormReturn

Defined in: [types.ts:72](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/form/src/types.ts#L72)

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

Defined in: [types.ts:74](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/form/src/types.ts#L74)

TanStack Form API instance for field binding and submission.

***

### isSubmitting

> **isSubmitting**: `boolean`

Defined in: [types.ts:76](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/form/src/types.ts#L76)

Whether the create mutation is currently in flight.

***

### reset()

> **reset**: () => `void`

Defined in: [types.ts:80](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/form/src/types.ts#L80)

Resets the form fields and clears the submission error.

#### Returns

`void`

***

### submitError

> **submitError**: `Error` \| `null`

Defined in: [types.ts:78](https://github.com/simplix-react/simplix-react/blob/2426719b5527895551fb3ee252c71ac8c52498fa/packages/form/src/types.ts#L78)

The most recent submission error, or `null` if the last attempt succeeded.
