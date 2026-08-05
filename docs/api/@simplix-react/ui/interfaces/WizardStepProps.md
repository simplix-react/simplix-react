[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / WizardStepProps

# Interface: WizardStepProps

Defined in: [packages/ui/src/crud/form/wizard.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L22)

Props for the Wizard.Step sub-component.

Each step defines its title, optional description, and an optional
async validation function that must return `true` to proceed.

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/form/wizard.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L30)

Step content.

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/form/wizard.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L26)

Optional description shown below the title.

***

### title

> **title**: `string`

Defined in: [packages/ui/src/crud/form/wizard.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L24)

Step title displayed in the step indicator.

***

### validate()?

> `optional` **validate**: () => `boolean` \| `Promise`\<`boolean`\>

Defined in: [packages/ui/src/crud/form/wizard.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L28)

Validation function called before advancing. Return `false` to block navigation.

#### Returns

`boolean` \| `Promise`\<`boolean`\>
