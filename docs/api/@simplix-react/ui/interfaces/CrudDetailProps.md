[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailProps

# Interface: CrudDetailProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L72)

Props for the [CrudDetail](../variables/CrudDetail.md) compound component root.

```
┌─────────────────────────────────────┐
│  header                       [X]   │
├─────────────────────────────────────┤
│  Section: "Basic Info"              │
│  Name:    Pet A                     │
│  Status:  Active                    │
│                                     │
│  Section: "Location"               │
│  Address: 123 Main St              │
│           [loading overlay...]      │
├─────────────────────────────────────┤
│  [← Back]        [Delete] [Edit]   │
└─────────────────────────────────────┘
```

## Properties

### auditData?

> `optional` **auditData**: [`AuditData`](AuditData.md)

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L88)

Audit metadata rendered as a fixed bar between the scrollable body and the footer.

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:91](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L91)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:90](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L90)

***

### fieldVariant?

> `optional` **fieldVariant**: [`FieldVariant`](FieldVariant.md)

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L89)

***

### footer?

> `optional` **footer**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:80](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L80)

Fixed footer rendered below the scrollable content (e.g. action buttons).

***

### header?

> `optional` **header**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:78](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L78)

Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label).

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:74](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L74)

Shows a semi-transparent overlay with a spinner on top of the detail content.

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L76)

Renders a close button (panel-right-close icon) at the right side of the header toolbar.

#### Returns

`void`

***

### variant?

> `optional` **variant**: [`CrudDetailVariant`](../type-aliases/CrudDetailVariant.md)

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:86](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L86)

Layout variant.
- `"default"` — compact padding for side panels (px-2).
- `"dialog"` — generous padding for use inside Dialog (px-5, extra vertical padding on header/footer).
