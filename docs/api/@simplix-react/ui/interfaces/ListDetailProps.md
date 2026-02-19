[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetailProps

# Interface: ListDetailProps

Defined in: packages/ui/src/crud/patterns/list-detail.tsx:56

Props for the [ListDetail](../variables/ListDetail.md) compound component.

## Properties

### activePanel?

> `optional` **activePanel**: `"list"` \| `"detail"`

Defined in: packages/ui/src/crud/patterns/list-detail.tsx:60

Controlled active panel. When provided, overrides internal state.

***

### children

> **children**: `ReactNode`

Defined in: packages/ui/src/crud/patterns/list-detail.tsx:66

***

### className?

> `optional` **className**: `string`

Defined in: packages/ui/src/crud/patterns/list-detail.tsx:65

***

### listWidth?

> `optional` **listWidth**: `ListWidth`

Defined in: packages/ui/src/crud/patterns/list-detail.tsx:62

List panel width ratio (only applies to `"panel"` variant).

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: packages/ui/src/crud/patterns/list-detail.tsx:64

Called when the dialog is dismissed (only applies to `"dialog"` variant).

#### Returns

`void`

***

### variant?

> `optional` **variant**: `ListDetailVariant`

Defined in: packages/ui/src/crud/patterns/list-detail.tsx:58

Layout variant. `"panel"` renders side-by-side, `"dialog"` renders detail in a modal.
