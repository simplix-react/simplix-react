[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / WizardProps

# Interface: WizardProps

Defined in: [packages/ui/src/crud/form/wizard.tsx:133](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L133)

Props for the [Wizard](../variables/Wizard.md) compound component root.

```
┌─────────────────────────────────────────┐
│  (1) Basic ── (2) Details ── (3) Review │
├─────────────────────────────────────────┤
│                                         │
│  Active step content                    │
│                                         │
├─────────────────────────────────────────┤
│  [Previous]                     [Next]  │
└─────────────────────────────────────────┘
```

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/form/wizard.tsx:138](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L138)

One or more `<Wizard.Step>` children.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/form/wizard.tsx:136](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L136)

***

### onComplete()

> **onComplete**: () => `void`

Defined in: [packages/ui/src/crud/form/wizard.tsx:135](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L135)

Called when the user completes the final step.

#### Returns

`void`
