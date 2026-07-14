[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailDefaultActionsProps

# Interface: CrudDetailDefaultActionsProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:235](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L235)

Props for the CrudDetail.DefaultActions sub-component.

## Properties

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:246](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L246)

Label for the back button (defaults to `"Back"`).

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:249](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L249)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:244](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L244)

Label for the close button (defaults to `"Close"`).

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:248](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L248)

Label for the edit button (defaults to `"Edit"`).

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:242](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L242)

When true, disables Edit and Delete action buttons.

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:238](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L238)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:236](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L236)

#### Returns

`void`

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:239](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L239)

#### Returns

`void`

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:240](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L240)

#### Returns

`void`
