[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailDefaultActionsProps

# Interface: CrudDetailDefaultActionsProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:312](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L312)

Props for the CrudDetail.DefaultActions sub-component, shared with CrudDetail.ActionFooter.

## Extended by

- [`CrudDetailActionFooterProps`](CrudDetailActionFooterProps.md)

## Properties

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:323](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L323)

Overrides the back button label (defaults to the translated `common.back`).

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:330](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L330)

Extra action buttons rendered in the right-side group, before Edit.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:328](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L328)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:321](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L321)

Overrides the close button label (defaults to the translated `common.close`).

***

### deleteDisabled?

> `optional` **deleteDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:336](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L336)

Disables Delete on its own (independent of `isPending`); pair with `deleteDisabledReason`.

***

### deleteDisabledReason?

> `optional` **deleteDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:338](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L338)

Native tooltip explaining why Delete is disabled.

***

### deleteLabel?

> `optional` **deleteLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:327](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L327)

Overrides the delete button label (defaults to the translated `common.delete`).

***

### editDisabled?

> `optional` **editDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:332](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L332)

Disables Edit on its own (independent of `isPending`); pair with `editDisabledReason`.

***

### editDisabledReason?

> `optional` **editDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:334](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L334)

Native tooltip explaining why Edit is disabled.

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:325](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L325)

Overrides the edit button label (defaults to the translated `common.edit`).

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:319](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L319)

When true, disables Edit and Delete action buttons.

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:315](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L315)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:313](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L313)

#### Returns

`void`

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:316](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L316)

#### Returns

`void`

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:317](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L317)

#### Returns

`void`
