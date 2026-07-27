[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetail

# Variable: CrudDetail

> `const` **CrudDetail**: (`__namedParameters`) => `Element` & `object`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:435](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L435)

Compound component for building read-only CRUD detail views.

```
┌─────────────────────────────────────┐
│  header                       [X]   │
├─────────────────────────────────────┤
│  <CrudDetail.Section>               │
│    field rows (label: value)        │
│  </CrudDetail.Section>             │
├─────────────────────────────────────┤
│  AuditFooter (via auditData prop)  │
├─────────────────────────────────────┤
│  <CrudDetail.DefaultActions>        │
│  [← Back]        [Delete] [Edit]   │
└─────────────────────────────────────┘
```

Sub-components: Section, Actions, DefaultActions, ActionFooter, AuditFooter.
Use `DefaultActions` for a single-row footer, `ActionFooter` for a two-tier footer
(a domain lifecycle-action row above the standard row).

## Type Declaration

### ActionFooter()

> **ActionFooter**: (`__namedParameters`) => `Element` = `DetailActionFooter`

Two-tier detail footer: a wrapping row of domain lifecycle `actions` on top, the
standard Close/Back + Delete/Edit row beneath — for detail panels whose entity has
more actions than the single DetailDefaultActions row holds. The two rows
share one divider above the whole block.

#### Parameters

##### \_\_namedParameters

[`CrudDetailActionFooterProps`](../interfaces/CrudDetailActionFooterProps.md)

#### Returns

`Element`

### Actions()

> **Actions**: (`__namedParameters`) => `Element` = `DetailActions`

#### Parameters

##### \_\_namedParameters

[`CrudDetailActionsProps`](../interfaces/CrudDetailActionsProps.md)

#### Returns

`Element`

### AuditFooter()

> **AuditFooter**: (`__namedParameters`) => `Element` \| `null` = `DetailAuditFooter`

#### Parameters

##### \_\_namedParameters

[`CrudDetailAuditFooterProps`](../interfaces/CrudDetailAuditFooterProps.md)

#### Returns

`Element` \| `null`

### DefaultActions()

> **DefaultActions**: (`props`) => `Element` = `DetailDefaultActions`

Standard single-row detail footer: Close/Back on the left, Delete / extra children /
Edit on the right. Use DetailActionFooter when the entity has domain
lifecycle actions that need their own row above this one.

#### Parameters

##### props

[`CrudDetailDefaultActionsProps`](../interfaces/CrudDetailDefaultActionsProps.md)

#### Returns

`Element`

### Section()

> **Section**: (`__namedParameters`) => `Element` = `DetailSection`

#### Parameters

##### \_\_namedParameters

[`CrudDetailSectionProps`](../interfaces/CrudDetailSectionProps.md)

#### Returns

`Element`
