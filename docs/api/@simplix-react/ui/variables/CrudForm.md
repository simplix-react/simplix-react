[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudForm

# Variable: CrudForm

> `const` **CrudForm**: (`__namedParameters`) => `Element` & `object`

Defined in: [packages/ui/src/crud/form/crud-form.tsx:191](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/crud-form.tsx#L191)

Compound component for building CRUD create/edit form layouts.

```
┌─────────────────────────────────────┐
│  header                       [X]   │
├─────────────────────────────────────┤
│  <CrudForm.Section>                 │
│    form fields (Grid layout)        │
│  </CrudForm.Section>               │
├─────────────────────────────────────┤
│  <CrudForm.Actions>                 │
│              [Cancel]  [Save]       │
└─────────────────────────────────────┘
```

Sub-components: Section (with layout variants), Actions.

## Type Declaration

### Actions()

> **Actions**: (`__namedParameters`) => `Element` = `FormActions`

#### Parameters

##### \_\_namedParameters

[`CrudFormActionsProps`](../interfaces/CrudFormActionsProps.md)

#### Returns

`Element`

### Section()

> **Section**: (`__namedParameters`) => `Element` = `FormSection`

#### Parameters

##### \_\_namedParameters

[`CrudFormSectionProps`](../interfaces/CrudFormSectionProps.md)

#### Returns

`Element`
