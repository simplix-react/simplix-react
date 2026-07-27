[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailProps

# Interface: CrudDetailProps

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:73](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L73)

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

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L89)

Audit metadata rendered as a fixed bar between the scrollable body and the footer.

***

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:99](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L99)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:98](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L98)

***

### displayZone?

> `optional` **displayZone**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:96](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L96)

IANA display timezone for the audit footer's timestamps. Falls back to the
ambient `DisplayZoneProvider` zone (then the browser zone) when omitted —
pass it on screens whose fields pin a zone other than the ambient one so
the audit stamps agree with the rest of the panel.

***

### fieldVariant?

> `optional` **fieldVariant**: [`FieldVariant`](FieldVariant.md)

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:97](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L97)

***

### footer?

> `optional` **footer**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:81](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L81)

Fixed footer rendered below the scrollable content (e.g. action buttons).

***

### header?

> `optional` **header**: `ReactNode`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:79](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L79)

Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label).

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L75)

Shows a semi-transparent overlay with a spinner on top of the detail content.

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L77)

Renders a close button (panel-right-close icon) at the right side of the header toolbar.

#### Returns

`void`

***

### variant?

> `optional` **variant**: [`CrudDetailVariant`](../type-aliases/CrudDetailVariant.md)

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:87](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L87)

Layout variant.
- `"default"` — compact padding for side panels (px-3).
- `"dialog"` — generous padding for use inside Dialog (px-5, extra vertical padding on header/footer).
