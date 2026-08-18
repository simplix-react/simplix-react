[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailActionFooterProps

# Interface: CrudDetailActionFooterProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:410](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L410)

Props for the CrudDetail.ActionFooter sub-component.

## Extends

- [`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md)

## Properties

### actions

> **actions**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:417](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L417)

Domain lifecycle action buttons (submit, review, cancel, resend, renew, …) that
fill the footer's top row. Actions that are not currently applicable stay visible
but disabled (with a `title` reason) rather than being hidden, so the action bar is
stable regardless of the record's state.

***

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:300](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L300)

Label for the back button (defaults to `"Back"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`backLabel`](CrudDetailDefaultActionsProps.md#backlabel)

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:307](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L307)

Extra action buttons rendered in the right-side group, before Edit.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`children`](CrudDetailDefaultActionsProps.md#children)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:305](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L305)

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`className`](CrudDetailDefaultActionsProps.md#classname)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:298](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L298)

Label for the close button (defaults to `"Close"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`closeLabel`](CrudDetailDefaultActionsProps.md#closelabel)

***

### deleteDisabled?

> `optional` **deleteDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:313](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L313)

Disables Delete on its own (independent of `isPending`); pair with `deleteDisabledReason`.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteDisabled`](CrudDetailDefaultActionsProps.md#deletedisabled)

***

### deleteDisabledReason?

> `optional` **deleteDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:315](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L315)

Native tooltip explaining why Delete is disabled.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteDisabledReason`](CrudDetailDefaultActionsProps.md#deletedisabledreason)

***

### deleteLabel?

> `optional` **deleteLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:304](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L304)

Label for the delete button (defaults to `"Delete"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`deleteLabel`](CrudDetailDefaultActionsProps.md#deletelabel)

***

### editDisabled?

> `optional` **editDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:309](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L309)

Disables Edit on its own (independent of `isPending`); pair with `editDisabledReason`.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editDisabled`](CrudDetailDefaultActionsProps.md#editdisabled)

***

### editDisabledReason?

> `optional` **editDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:311](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L311)

Native tooltip explaining why Edit is disabled.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editDisabledReason`](CrudDetailDefaultActionsProps.md#editdisabledreason)

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:302](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L302)

Label for the edit button (defaults to `"Edit"`).

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`editLabel`](CrudDetailDefaultActionsProps.md#editlabel)

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:296](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L296)

When true, disables Edit and Delete action buttons.

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`isPending`](CrudDetailDefaultActionsProps.md#ispending)

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:292](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L292)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onBack`](CrudDetailDefaultActionsProps.md#onback)

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:290](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L290)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onClose`](CrudDetailDefaultActionsProps.md#onclose)

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:293](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L293)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onDelete`](CrudDetailDefaultActionsProps.md#ondelete)

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:294](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L294)

#### Returns

`void`

#### Inherited from

[`CrudDetailDefaultActionsProps`](CrudDetailDefaultActionsProps.md).[`onEdit`](CrudDetailDefaultActionsProps.md#onedit)
