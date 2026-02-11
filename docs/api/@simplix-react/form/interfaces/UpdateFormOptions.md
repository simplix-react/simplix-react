[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / UpdateFormOptions

# Interface: UpdateFormOptions

Defined in: types.ts:51

Options for the `useUpdateForm` hook.

## Example

```ts
const { form } = formHooks.task.useUpdateForm(taskId, {
  dirtyOnly: true,
  onSuccess: (data) => console.log("Updated:", data),
});
```

## Properties

### dirtyOnly?

> `optional` **dirtyOnly**: `boolean`

Defined in: types.ts:53

Send only changed fields to the server (PATCH-friendly). Defaults to `true`.

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: types.ts:57

Callback invoked when the mutation fails.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`data`) => `void`

Defined in: types.ts:55

Callback invoked after a successful mutation.

#### Parameters

##### data

`unknown`

#### Returns

`void`
