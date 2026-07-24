[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitOptions

# Interface: UseCrudFormSubmitOptions\<T, TId\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L13)

Options for the [useCrudFormSubmit](../functions/useCrudFormSubmit.md) hook.

## Type Parameters

### T

`T`

### TId

`TId` = `unknown`

## Properties

### create

> **create**: [`CrudMutation`](CrudMutation.md)\<`T`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L17)

Create mutation hook result.

***

### entityId?

> `optional` **entityId**: `TId`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L15)

Entity ID for edit mode. When nullish, create mode is used.

***

### i18nFields?

> `optional` **i18nFields**: `Record`\<`string`, `string`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L24)

Map of i18n field name → plain field name. Before submit, each plain
field is populated from `applyI18nFallback(values[i18nField], locales)`.

***

### locales?

> `optional` **locales**: readonly `object`[]

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L29)

Locale config order for fallback (typically `useLocalePicker().locales`).
Required when `i18nFields` is provided.

***

### onSuccess()?

> `optional` **onSuccess**: () => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L31)

Called after a successful create or update.

#### Returns

`void`

***

### update?

> `optional` **update**: [`CrudMutation`](CrudMutation.md)\<\{ `dto`: `T`; `id`: `TId`; \}\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L19)

Update mutation hook result. Required for edit mode.

***

### validator()?

> `optional` **validator**: (`values`) => `Record`\<`string`, `string`\> \| `null`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L67)

Optional client-side validator. Runs on submit BEFORE the server
mutation. Receives the raw form values (pre-i18n-fallback) and must
return either `null` / `{}` to pass, or `Record<field, message>` to
block the submit.

When the validator returns errors:
  - `fieldErrors` is set to the returned errors
  - the create/update mutation is NOT called
  - the form stays on screen

Client and server errors are temporally mutually exclusive: a failing
validator prevents the network call, so server errors cannot coexist
with client errors in the same submit attempt. A subsequent submit
either replaces the errors with new client errors, new server errors,
or clears them on success.

Wrap inline validator functions with `useCallback` / `useMemo` to keep
`handleSubmit` identity stable across renders.

#### Parameters

##### values

`T`

#### Returns

`Record`\<`string`, `string`\> \| `null`

#### Examples

```ts
import { zodToFieldErrors } from "@simplix-react/form";
import { createUserSchema } from "@my-app/domain-user";

validator: (v) => zodToFieldErrors(createUserSchema, v)
```

```ts
validator: (v) => v.email?.includes("@")
  ? null
  : { email: "Invalid email" }
```
