[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / UpdateFormOptions

# Interface: UpdateFormOptions

Defined in: [types.ts:45](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/form/src/types.ts#L45)

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

Defined in: [types.ts:47](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/form/src/types.ts#L47)

Send only changed fields to the server (PATCH-friendly). Defaults to `true`.

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [types.ts:51](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/form/src/types.ts#L51)

Callback invoked when the mutation fails.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`data`) => `void`

Defined in: [types.ts:49](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/form/src/types.ts#L49)

Callback invoked after a successful mutation.

#### Parameters

##### data

`unknown`

#### Returns

`void`
