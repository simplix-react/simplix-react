[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailActionFooterProps

# Interface: CrudDetailActionFooterProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:377](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L377)

Props for the CrudDetail.ActionFooter sub-component.

## Extends

- [`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md)

## Properties

### actions

> **actions**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:384](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L384)

Domain lifecycle action buttons (submit, review, cancel, resend, renew, …) that
fill the footer's top row. Actions that are not currently applicable stay visible
but disabled (with a `title` reason) rather than being hidden, so the action bar is
stable regardless of the record's state.

***

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:280](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L280)

Label for the back button (defaults to `"Back"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`backLabel`](CrudDetailDefaultActionsProps.md#backlabel)

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:285](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L285)

Extra action buttons rendered in the right-side group, before Edit.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`children`](CrudDetailDefaultActionsProps.md#children)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:283](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L283)

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`className`](CrudDetailDefaultActionsProps.md#classname)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:278](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L278)

Label for the close button (defaults to `"Close"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`closeLabel`](CrudDetailDefaultActionsProps.md#closelabel)

***

### deleteDisabled?

> `optional` **deleteDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:291](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L291)

Disables Delete on its own (independent of `isPending`); pair with `deleteDisabledReason`.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteDisabled`](CrudDetailDefaultActionsProps.md#deletedisabled)

***

### deleteDisabledReason?

> `optional` **deleteDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:293](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L293)

Native tooltip explaining why Delete is disabled.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteDisabledReason`](CrudDetailDefaultActionsProps.md#deletedisabledreason)

***

### editDisabled?

> `optional` **editDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:287](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L287)

Disables Edit on its own (independent of `isPending`); pair with `editDisabledReason`.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editDisabled`](CrudDetailDefaultActionsProps.md#editdisabled)

***

### editDisabledReason?

> `optional` **editDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:289](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L289)

Native tooltip explaining why Edit is disabled.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editDisabledReason`](CrudDetailDefaultActionsProps.md#editdisabledreason)

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:282](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L282)

Label for the edit button (defaults to `"Edit"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editLabel`](CrudDetailDefaultActionsProps.md#editlabel)

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:276](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L276)

When true, disables Edit and Delete action buttons.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`isPending`](CrudDetailDefaultActionsProps.md#ispending)

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:272](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L272)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onBack`](CrudDetailDefaultActionsProps.md#onback)

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:270](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L270)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onClose`](CrudDetailDefaultActionsProps.md#onclose)

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:273](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L273)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onDelete`](CrudDetailDefaultActionsProps.md#ondelete)

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:274](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L274)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onEdit`](CrudDetailDefaultActionsProps.md#onedit)
