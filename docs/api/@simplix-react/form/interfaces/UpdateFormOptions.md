[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / UpdateFormOptions

# Interface: UpdateFormOptions

Defined in: [types.ts:51](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L51)

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

Defined in: [types.ts:53](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L53)

Send only changed fields to the server (PATCH-friendly). Defaults to `true`.

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [types.ts:57](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L57)

Callback invoked when the mutation fails.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`data`) => `void`

Defined in: [types.ts:55](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/form/src/types.ts#L55)

Callback invoked after a successful mutation.

#### Parameters

##### data

`unknown`

#### Returns

`void`
