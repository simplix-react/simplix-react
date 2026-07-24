[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailAuditFooterProps

# Interface: CrudDetailAuditFooterProps

Defined in: [packages/ui/src/crud/detail/crud-detail-audit-footer.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-audit-footer.tsx#L26)

Props for the [DetailAuditFooter](../variables/CrudDetail.md) sub-component.

## Properties

### auditData?

> `optional` **auditData**: [`AuditData`](AuditData.md)

Defined in: [packages/ui/src/crud/detail/crud-detail-audit-footer.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-audit-footer.tsx#L28)

Audit metadata. When nullish or all fields empty, the component renders nothing.

***

### displayZone?

> `optional` **displayZone**: `string`

Defined in: [packages/ui/src/crud/detail/crud-detail-audit-footer.tsx:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail-audit-footer.tsx#L33)

IANA display zone for the created/updated instants. When set, both stamps
render as that zone's wall clock; when omitted, the browser zone applies.
