[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailActionFooterProps

# Interface: CrudDetailActionFooterProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:388](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L388)

Props for the CrudDetail.ActionFooter sub-component.

## Extends

- [`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md)

## Properties

### actions

> **actions**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:395](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L395)

Domain lifecycle action buttons (submit, review, cancel, resend, renew, …) that
fill the footer's top row. Actions that are not currently applicable stay visible
but disabled (with a `title` reason) rather than being hidden, so the action bar is
stable regardless of the record's state.

***

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:285](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L285)

Label for the back button (defaults to `"Back"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`backLabel`](CrudDetailDefaultActionsProps.md#backlabel)

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:292](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L292)

Extra action buttons rendered in the right-side group, before Edit.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`children`](CrudDetailDefaultActionsProps.md#children)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:290](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L290)

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`className`](CrudDetailDefaultActionsProps.md#classname)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:283](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L283)

Label for the close button (defaults to `"Close"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`closeLabel`](CrudDetailDefaultActionsProps.md#closelabel)

***

### deleteDisabled?

> `optional` **deleteDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:298](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L298)

Disables Delete on its own (independent of `isPending`); pair with `deleteDisabledReason`.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteDisabled`](CrudDetailDefaultActionsProps.md#deletedisabled)

***

### deleteDisabledReason?

> `optional` **deleteDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:300](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L300)

Native tooltip explaining why Delete is disabled.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteDisabledReason`](CrudDetailDefaultActionsProps.md#deletedisabledreason)

***

### deleteLabel?

> `optional` **deleteLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:289](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L289)

Label for the delete button (defaults to `"Delete"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteLabel`](CrudDetailDefaultActionsProps.md#deletelabel)

***

### editDisabled?

> `optional` **editDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:294](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L294)

Disables Edit on its own (independent of `isPending`); pair with `editDisabledReason`.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editDisabled`](CrudDetailDefaultActionsProps.md#editdisabled)

***

### editDisabledReason?

> `optional` **editDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:296](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L296)

Native tooltip explaining why Edit is disabled.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editDisabledReason`](CrudDetailDefaultActionsProps.md#editdisabledreason)

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:287](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L287)

Label for the edit button (defaults to `"Edit"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editLabel`](CrudDetailDefaultActionsProps.md#editlabel)

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:281](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L281)

When true, disables Edit and Delete action buttons.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`isPending`](CrudDetailDefaultActionsProps.md#ispending)

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:277](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L277)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onBack`](CrudDetailDefaultActionsProps.md#onback)

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:275](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L275)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onClose`](CrudDetailDefaultActionsProps.md#onclose)

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:278](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L278)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onDelete`](CrudDetailDefaultActionsProps.md#ondelete)

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:279](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L279)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onEdit`](CrudDetailDefaultActionsProps.md#onedit)
