[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetail

# Variable: CrudDetail

> `const` **CrudDetail**: (`__namedParameters`) => `Element` & `object`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:287](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L287)

Compound component for building read-only CRUD detail views.

```
┌─────────────────────────────────────┐
│  header                       [X]   │
├─────────────────────────────────────┤
│  <CrudDetail.Section>               │
│    field rows (label: value)        │
│  </CrudDetail.Section>             │
├─────────────────────────────────────┤
│  <CrudDetail.DefaultActions>        │
│  [← Back]        [Delete] [Edit]   │
└─────────────────────────────────────┘
```

Sub-components: Section, Actions, DefaultActions.

## Type Declaration

### Actions()

> **Actions**: (`__namedParameters`) => `Element` = `DetailActions`

#### Parameters

##### \_\_namedParameters

[`CrudDetailActionsProps`](../interfaces/CrudDetailActionsProps.md)

#### Returns

`Element`

### DefaultActions()

> **DefaultActions**: (`__namedParameters`) => `Element` = `DetailDefaultActions`

#### Parameters

##### \_\_namedParameters

[`CrudDetailDefaultActionsProps`](../interfaces/CrudDetailDefaultActionsProps.md)

#### Returns

`Element`

### Section()

> **Section**: (`props`) => `Element` = `DetailSection`

#### Parameters

##### props

`SectionShellProps`

#### Returns

`Element`
