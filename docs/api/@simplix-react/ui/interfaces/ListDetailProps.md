[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetailProps

# Interface: ListDetailProps

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:56](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/list-detail.tsx#L56)

Props for the [ListDetail](../variables/ListDetail.md) compound component.

## Properties

### activePanel?

> `optional` **activePanel**: `"list"` \| `"detail"`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:60](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/list-detail.tsx#L60)

Controlled active panel. When provided, overrides internal state.

***

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:66](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/list-detail.tsx#L66)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:65](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/list-detail.tsx#L65)

***

### listWidth?

> `optional` **listWidth**: [`ListWidth`](../type-aliases/ListWidth.md)

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:62](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/list-detail.tsx#L62)

List panel width ratio (only applies to `"panel"` variant).

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:64](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/list-detail.tsx#L64)

Called when the dialog is dismissed (only applies to `"dialog"` variant).

#### Returns

`void`

***

### variant?

> `optional` **variant**: [`ListDetailVariant`](../type-aliases/ListDetailVariant.md)

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:58](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/list-detail.tsx#L58)

Layout variant. `"panel"` renders side-by-side, `"dialog"` renders detail in a modal.
