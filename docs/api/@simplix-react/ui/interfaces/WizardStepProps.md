[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / WizardStepProps

# Interface: WizardStepProps

Defined in: [packages/ui/src/crud/form/wizard.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L21)

Props for the Wizard.Step sub-component.

Each step defines its title, optional description, and an optional
async validation function that must return `true` to proceed.

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/form/wizard.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L29)

Step content.

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/form/wizard.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L25)

Optional description shown below the title.

***

### title

> **title**: `string`

Defined in: [packages/ui/src/crud/form/wizard.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L23)

Step title displayed in the step indicator.

***

### validate()?

> `optional` **validate**: () => `boolean` \| `Promise`\<`boolean`\>

Defined in: [packages/ui/src/crud/form/wizard.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L27)

Validation function called before advancing. Return `false` to block navigation.

#### Returns

`boolean` \| `Promise`\<`boolean`\>
