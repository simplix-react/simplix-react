[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / UpdateFormReturn

# Interface: UpdateFormReturn\<TSchema\>

Defined in: [types.ts:110](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L110)

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

Defined in: [types.ts:120](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L120)

The loaded entity data, or `undefined` while loading.

***

### form

> **form**: `AnyFormApi`

Defined in: [types.ts:112](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L112)

TanStack Form API instance for field binding and submission.

***

### isLoading

> **isLoading**: `boolean`

Defined in: [types.ts:114](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L114)

Whether the entity data is still loading from the server.

***

### isSubmitting

> **isSubmitting**: `boolean`

Defined in: [types.ts:116](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L116)

Whether the update mutation is currently in flight.

***

### submitError

> **submitError**: `Error` \| `null`

Defined in: [types.ts:118](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L118)

The most recent submission error, or `null` if the last attempt succeeded.
