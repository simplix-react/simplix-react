[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / UpdateFormReturn

# Interface: UpdateFormReturn\<TSchema\>

Defined in: [types.ts:104](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/form/src/types.ts#L104)

Return value of the `useUpdateForm` hook.

## Example

```ts
const { form, isLoading, isSubmitting, entity } = formHooks.task.useUpdateForm(taskId);

if (isLoading) return <p>Loading...</p>;

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
    <form.Field name="title">
      {(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
    </form.Field>
    <button type="submit" disabled={isSubmitting}>Save</button>
  </form>
);
```

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodTypeAny`

Zod schema type for the entity

## Properties

### entity

> **entity**: `output`\<`TSchema`\> \| `undefined`

Defined in: [types.ts:114](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/form/src/types.ts#L114)

The loaded entity data, or `undefined` while loading.

***

### form

> **form**: `AnyFormApi`

Defined in: [types.ts:106](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/form/src/types.ts#L106)

TanStack Form API instance for field binding and submission.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [types.ts:108](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/form/src/types.ts#L108)

Whether the entity data is still loading from the server.

***

### isSubmitting

> **isSubmitting**: `boolean`

Defined in: [types.ts:110](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/form/src/types.ts#L110)

Whether the update mutation is currently in flight.

***

### submitError

> **submitError**: `Error` \| `null`

Defined in: [types.ts:112](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/form/src/types.ts#L112)

The most recent submission error, or `null` if the last attempt succeeded.
