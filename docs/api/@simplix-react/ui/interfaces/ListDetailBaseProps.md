[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetailBaseProps

# Interface: ListDetailBaseProps

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:87](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L87)

Common props shared by all width variants.

## Properties

### activePanel?

> `optional` **activePanel**: `"list"` \| `"detail"`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:91](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L91)

Controlled active panel. When provided, overrides internal state.

***

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:97](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L97)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:96](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L96)

***

### dialogHeight?

> `optional` **dialogHeight**: `string`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:95](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L95)

Fixed dialog height (e.g. `"60vh"`, `"500px"`). When set, the dialog uses a fixed height with internal scrolling. When omitted, height fits content up to `max-h-[85vh]`. Only applies to `"dialog"` variant.

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:93](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L93)

Called when the dialog is dismissed (only applies to `"dialog"` variant).

#### Returns

`void`

***

### variant?

> `optional` **variant**: [`ListDetailVariant`](../type-aliases/ListDetailVariant.md)

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L89)

Layout variant. `"panel"` renders side-by-side, `"dialog"` renders detail in a modal.
