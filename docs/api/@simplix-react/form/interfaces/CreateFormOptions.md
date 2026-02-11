[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / CreateFormOptions

# Interface: CreateFormOptions\<TCreate\>

Defined in: [types.ts:29](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L29)

Options for the `useCreateForm` hook.

## Example

```ts
const { form } = formHooks.task.useCreateForm(projectId, {
  defaultValues: { title: "", status: "open" },
  resetOnSuccess: true,
  onSuccess: (data) => console.log("Created:", data),
  onError: (error) => console.error(error),
});
```

## Type Parameters

### TCreate

`TCreate` *extends* `z.ZodTypeAny`

Zod schema type for the create DTO

## Properties

### defaultValues?

> `optional` **defaultValues**: `Partial`\<`output`\<`TCreate`\>\>

Defined in: [types.ts:31](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L31)

Initial form field values.

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [types.ts:37](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L37)

Callback invoked when the mutation fails.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`data`) => `void`

Defined in: [types.ts:35](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L35)

Callback invoked after a successful mutation.

#### Parameters

##### data

`unknown`

#### Returns

`void`

***

### resetOnSuccess?

> `optional` **resetOnSuccess**: `boolean`

Defined in: [types.ts:33](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L33)

Reset the form after successful submission. Defaults to `true`.
