[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / Wizard

# Variable: Wizard

> `const` **Wizard**: (`__namedParameters`) => `Element` & `object`

Defined in: [packages/ui/src/crud/form/wizard.tsx:262](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/wizard.tsx#L262)

Multi-step form wizard with step indicator, validation, and navigation.

```
┌─────────────────────────────────────────┐
│  (1) Basic ── (2) Details ── (3) Review │
├─────────────────────────────────────────┤
│  <Wizard.Step title="Basic">            │
│    form fields...                       │
│  </Wizard.Step>                         │
├─────────────────────────────────────────┤
│  [Previous]                  [Next]     │
└─────────────────────────────────────────┘
```

Sub-components: Step (with title, description, and optional validate function).

## Type Declaration

### Step()

> **Step**: (`__namedParameters`) => `Element` = `WizardStep`

#### Parameters

##### \_\_namedParameters

[`WizardStepProps`](../interfaces/WizardStepProps.md)

#### Returns

`Element`

## Example

```tsx
<Wizard onComplete={handleSubmit}>
  <Wizard.Step title="Basic" validate={() => form.validate()}>
    <TextField label="Name" ... />
  </Wizard.Step>
  <Wizard.Step title="Review">
    <p>Confirm your data.</p>
  </Wizard.Step>
</Wizard>
```
