[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseCrudFormSubmitResult

# Interface: UseCrudFormSubmitResult\<T\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L88)

Return type of [useCrudFormSubmit](../functions/useCrudFormSubmit.md).

## Type Parameters

### T

`T`

## Properties

### fieldErrors

> **fieldErrors**: `Record`\<`string`, `string`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:96](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L96)

Server validation errors keyed by field name. Empty when no errors.

***

### fieldLabels

> **fieldLabels**: `Record`\<`string`, `string`\>

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:107](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L107)

What the server calls each refused field, keyed by field name. Empty when no errors, and
missing entries for fields the server labelled nothing.

#### Remarks

A form can only name the fields it draws. When the server refuses one it does not — a field it
fills in itself, or one added to the DTO since — a summary that resolves names out of the
form's own catalogue has nothing to resolve and prints the lookup key at the reader. These are
the server's own names, already localized, so that case has something readable to fall back to.

***

### handleSubmit()

> **handleSubmit**: (`values`) => `void`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:92](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L92)

Submit handler that dispatches to create or update mutation.

#### Parameters

##### values

`T`

#### Returns

`void`

***

### isEdit

> **isEdit**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L90)

Whether the form is in edit mode (entity already exists).

***

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/form/use-crud-form-submit.ts:94](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-crud-form-submit.ts#L94)

Whether the active mutation is pending.
