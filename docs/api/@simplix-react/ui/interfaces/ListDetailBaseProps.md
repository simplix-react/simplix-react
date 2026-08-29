[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetailBaseProps

# Interface: ListDetailBaseProps

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:100](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L100)

Common props shared by all width variants.

## Properties

### activePanel?

> `optional` **activePanel**: `"list"` \| `"detail"`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:104](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L104)

Controlled active panel. When provided, overrides internal state.

***

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:110](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L110)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:109](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L109)

***

### dialogHeight?

> `optional` **dialogHeight**: `string`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:108](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L108)

Fixed dialog height (e.g. `"60vh"`, `"500px"`). When set, the dialog uses a fixed height with internal scrolling. When omitted, height fits content up to `max-h-[85vh]`. Only applies to `"dialog"` variant.

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:106](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L106)

Called when the dialog is dismissed (only applies to `"dialog"` variant).

#### Returns

`void`

***

### variant?

> `optional` **variant**: [`ListDetailVariant`](../type-aliases/ListDetailVariant.md)

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:102](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L102)

Layout variant. `"panel"` renders side-by-side, `"dialog"` renders detail in a modal.
