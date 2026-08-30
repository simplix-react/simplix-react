[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@simplix-react/ui](../../../README.md) / [FormFields](../README.md) / NumberField

# Function: NumberField()

> **NumberField**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/number-field.tsx:76](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/number-field.tsx#L76)

Numeric input field with null handling for empty values and
always-visible spinner buttons.

<p><b>Its width follows the value, not the row.</b> A box stretched to the width of the text
field above it asks for a sentence, and a two-digit field spanning half the panel stops saying
what goes in it. The measure is worked out from `min`, `max` and `step` — the same bounds the
field already validates against — so a screen states its range once and gets the width with it.

## Parameters

### \_\_namedParameters

[`NumberFieldProps`](../interfaces/NumberFieldProps.md)

## Returns

`Element`

## Example

```tsx
<NumberField label="Age" value={age} onChange={setAge} min={0} max={150} />
```
