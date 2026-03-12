[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailDefaultActionsProps

# Interface: CrudDetailDefaultActionsProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:233](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L233)

Props for the CrudDetail.DefaultActions sub-component.

## Properties

### backLabel?

> `optional` **backLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:242](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L242)

Label for the back button (defaults to `"Back"`).

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:245](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L245)

***

### closeLabel?

> `optional` **closeLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:240](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L240)

Label for the close button (defaults to `"Close"`).

***

### editLabel?

> `optional` **editLabel**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:244](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L244)

Label for the edit button (defaults to `"Edit"`).

***

### onBack()?

> `optional` **onBack**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:236](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L236)

Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`.

#### Returns

`void`

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:234](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L234)

#### Returns

`void`

***

### onDelete()?

> `optional` **onDelete**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:237](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L237)

#### Returns

`void`

***

### onEdit()?

> `optional` **onEdit**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:238](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L238)

#### Returns

`void`
