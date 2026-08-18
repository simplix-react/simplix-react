[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailDefaultActionsProps

# Interface: CrudDetailDefaultActionsProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:289](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L289)

Props for the CrudDetail.DefaultActions sub-component, shared with CrudDetail.ActionFooter.

## Extended by

- [`CrudDetailActionFooterProps`](CrudDetailActionFooterProps.md)

## Properties

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:300](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L300)

Label for the back button (defaults to `"Back"`).

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:307](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L307)

Extra action buttons rendered in the right-side group, before Edit.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:305](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L305)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:298](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L298)

Label for the close button (defaults to `"Close"`).

***

### deleteDisabled?

> `optional` **deleteDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:313](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L313)

Disables Delete on its own (independent of `isPending`); pair with `deleteDisabledReason`.

***

### deleteDisabledReason?

> `optional` **deleteDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:315](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L315)

Native tooltip explaining why Delete is disabled.

***

### deleteLabel?

> `optional` **deleteLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:304](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L304)

Label for the delete button (defaults to `"Delete"`).

***

### editDisabled?

> `optional` **editDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:309](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L309)

Disables Edit on its own (independent of `isPending`); pair with `editDisabledReason`.

***

### editDisabledReason?

> `optional` **editDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:311](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L311)

Native tooltip explaining why Edit is disabled.

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:302](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L302)

Label for the edit button (defaults to `"Edit"`).

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:296](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L296)

When true, disables Edit and Delete action buttons.

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:292](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L292)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:290](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L290)

#### Returns

`void`

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:293](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L293)

#### Returns

`void`

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:294](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L294)

#### Returns

`void`
