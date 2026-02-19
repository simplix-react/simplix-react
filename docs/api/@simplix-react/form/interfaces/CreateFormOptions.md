[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / CreateFormOptions

# Interface: CreateFormOptions\<TCreate\>

Defined in: [types.ts:23](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/form/src/types.ts#L23)

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

Defined in: [types.ts:25](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/form/src/types.ts#L25)

Initial form field values.

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [types.ts:31](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/form/src/types.ts#L31)

Callback invoked when the mutation fails.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`data`) => `void`

Defined in: [types.ts:29](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/form/src/types.ts#L29)

Callback invoked after a successful mutation.

#### Parameters

##### data

`unknown`

#### Returns

`void`

***

### resetOnSuccess?

> `optional` **resetOnSuccess**: `boolean`

Defined in: [types.ts:27](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/form/src/types.ts#L27)

Reset the form after successful submission. Defaults to `true`.
