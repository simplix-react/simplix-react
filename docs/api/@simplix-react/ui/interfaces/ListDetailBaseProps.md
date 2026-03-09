[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetailBaseProps

# Interface: ListDetailBaseProps

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L86)

Common props shared by all width variants.

## Properties

### activePanel?

> `optional` **activePanel**: `"list"` \| `"detail"`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L90)

Controlled active panel. When provided, overrides internal state.

***

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:94](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L94)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:93](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L93)

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:92](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L92)

Called when the dialog is dismissed (only applies to `"dialog"` variant).

#### Returns

`void`

***

### variant?

> `optional` **variant**: [`ListDetailVariant`](../type-aliases/ListDetailVariant.md)

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L88)

Layout variant. `"panel"` renders side-by-side, `"dialog"` renders detail in a modal.
