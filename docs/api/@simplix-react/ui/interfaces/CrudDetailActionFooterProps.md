[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailActionFooterProps

# Interface: CrudDetailActionFooterProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:434](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L434)

Props for the CrudDetail.ActionFooter sub-component.

## Extends

- [`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md)

## Properties

### actions

> **actions**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:441](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L441)

Domain lifecycle action buttons (submit, review, cancel, resend, renew, …) that
fill the footer's top row. Actions that are not currently applicable stay visible
but disabled (with a `title` reason) rather than being hidden, so the action bar is
stable regardless of the record's state.

***

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:323](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L323)

Overrides the back button label (defaults to the translated `common.back`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`backLabel`](CrudDetailDefaultActionsProps.md#backlabel)

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:330](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L330)

Extra action buttons rendered in the right-side group, before Edit.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`children`](CrudDetailDefaultActionsProps.md#children)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:328](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L328)

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`className`](CrudDetailDefaultActionsProps.md#classname)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:321](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L321)

Overrides the close button label (defaults to the translated `common.close`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`closeLabel`](CrudDetailDefaultActionsProps.md#closelabel)

***

### deleteDisabled?

> `optional` **deleteDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:336](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L336)

Disables Delete on its own (independent of `isPending`); pair with `deleteDisabledReason`.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteDisabled`](CrudDetailDefaultActionsProps.md#deletedisabled)

***

### deleteDisabledReason?

> `optional` **deleteDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:338](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L338)

Native tooltip explaining why Delete is disabled.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteDisabledReason`](CrudDetailDefaultActionsProps.md#deletedisabledreason)

***

### deleteLabel?

> `optional` **deleteLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:327](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L327)

Overrides the delete button label (defaults to the translated `common.delete`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteLabel`](CrudDetailDefaultActionsProps.md#deletelabel)

***

### editDisabled?

> `optional` **editDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:332](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L332)

Disables Edit on its own (independent of `isPending`); pair with `editDisabledReason`.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editDisabled`](CrudDetailDefaultActionsProps.md#editdisabled)

***

### editDisabledReason?

> `optional` **editDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:334](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L334)

Native tooltip explaining why Edit is disabled.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editDisabledReason`](CrudDetailDefaultActionsProps.md#editdisabledreason)

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:325](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L325)

Overrides the edit button label (defaults to the translated `common.edit`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editLabel`](CrudDetailDefaultActionsProps.md#editlabel)

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:319](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L319)

When true, disables Edit and Delete action buttons.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`isPending`](CrudDetailDefaultActionsProps.md#ispending)

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:315](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L315)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onBack`](CrudDetailDefaultActionsProps.md#onback)

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:313](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L313)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onClose`](CrudDetailDefaultActionsProps.md#onclose)

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:316](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L316)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onDelete`](CrudDetailDefaultActionsProps.md#ondelete)

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:317](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L317)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onEdit`](CrudDetailDefaultActionsProps.md#onedit)
