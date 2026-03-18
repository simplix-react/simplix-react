[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useIsDirty

# Function: useIsDirty()

> **useIsDirty**\<`T`\>(`current`, `initial`): `boolean`

Defined in: [packages/ui/src/crud/form/use-is-dirty.ts:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-is-dirty.ts#L35)

Detect whether form values have changed via shallow comparison.
Supports Date-aware comparison for date fields.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

Form values object type.

## Parameters

### current

`T`

Current form values.

### initial

`T`

Initial (clean) form values.

## Returns

`boolean`

`true` if any top-level value differs.

## Example

```ts
const isDirty = useIsDirty(formValues, initialValues);
useBeforeUnload(isDirty);
```
