[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailDefaultActionsProps

# Interface: CrudDetailDefaultActionsProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:269](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L269)

Props for the CrudDetail.DefaultActions sub-component, shared with CrudDetail.ActionFooter.

## Extended by

- [`CrudDetailActionFooterProps`](CrudDetailActionFooterProps.md)

## Properties

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:280](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L280)

Label for the back button (defaults to `"Back"`).

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:285](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L285)

Extra action buttons rendered in the right-side group, before Edit.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:283](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L283)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:278](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L278)

Label for the close button (defaults to `"Close"`).

***

### deleteDisabled?

> `optional` **deleteDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:291](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L291)

Disables Delete on its own (independent of `isPending`); pair with `deleteDisabledReason`.

***

### deleteDisabledReason?

> `optional` **deleteDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:293](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L293)

Native tooltip explaining why Delete is disabled.

***

### editDisabled?

> `optional` **editDisabled**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:287](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L287)

Disables Edit on its own (independent of `isPending`); pair with `editDisabledReason`.

***

### editDisabledReason?

> `optional` **editDisabledReason**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:289](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L289)

Native tooltip explaining why Edit is disabled.

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:282](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L282)

Label for the edit button (defaults to `"Edit"`).

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:276](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L276)

When true, disables Edit and Delete action buttons.

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:272](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L272)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:270](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L270)

#### Returns

`void`

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:273](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L273)

#### Returns

`void`

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:274](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L274)

#### Returns

`void`
