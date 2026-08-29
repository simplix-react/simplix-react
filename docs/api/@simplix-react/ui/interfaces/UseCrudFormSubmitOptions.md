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

### create?

> `optional` **create**: [`CrudMutation`](CrudMutation.md)\<`T`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L26)

Create mutation hook result. Omit it on a form that only ever edits.

#### Remarks

A form reached from a record — an edit panel, a settings pane — has no create path, and
demanding one here meant registering a mutation the screen never calls. That is what sent
those forms to a raw `mutateAsync` with a toast instead, which throws away the per-field
detail the server sends with a refusal. One of `create` and `update` has to be there for the
mode the form is in.

***

### entityId?

> `optional` **entityId**: `TId`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L15)

Entity ID for edit mode. When nullish, create mode is used.

***

### i18nFields?

> `optional` **i18nFields**: `Record`\<`string`, `string`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L33)

Map of i18n field name → plain field name. Before submit, each plain
field is populated from `applyI18nFallback(values[i18nField], locales)`.

***

### locales?

> `optional` **locales**: readonly `object`[]

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L38)

Locale config order for fallback (typically `useLocalePicker().locales`).
Required when `i18nFields` is provided.

***

### onSuccess()?

> `optional` **onSuccess**: (`result`) => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L48)

Called after a successful create or update, with whatever the mutation answered.

#### Parameters

##### result

`unknown`

#### Returns

`void`

#### Remarks

A create form that navigates to the record it just made needs the new id, and the answer is
the only place it exists. The argument is `unknown` because create and update answer with
different shapes; narrow it the way the rest of the screen reads a response. Callers that do
not need it ignore it, as they always have.

***

### update?

> `optional` **update**: [`CrudMutation`](CrudMutation.md)\<\{ `dto`: `T`; `id`: `TId`; \}\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L28)

Update mutation hook result. Required for edit mode.

***

### validator()?

> `optional` **validator**: (`values`) => `Record`\<`string`, `string`\> \| `null`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L84)

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
