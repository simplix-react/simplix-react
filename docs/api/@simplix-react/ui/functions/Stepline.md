[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / Stepline

# Function: Stepline()

> **Stepline**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/display/stepline.tsx:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/stepline.tsx#L84)

Wizard step indicator: numbered circles joined by connector lines, so a step
reads as a position in a sequence — done steps show a check, the active step
is highlighted, upcoming steps stay muted. Purely presentational — the
caller owns which step is active.

## Parameters

### \_\_namedParameters

[`SteplineProps`](../interfaces/SteplineProps.md)

## Returns

`Element`

## Example

```tsx
<Stepline
  items={[
    { key: "register", label: "Register" },
    { key: "sign", label: "Sign agreements" },
    { key: "training", label: "Complete training" },
  ]}
  current="sign"
/>
```
