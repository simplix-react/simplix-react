[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ChoiceChips

# Function: ChoiceChips()

> **ChoiceChips**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/crud/filters/choice-chips.tsx:75](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/filters/choice-chips.tsx#L75)

A pill row where exactly one option is lit.

<p><b>Why this is a component of its own rather than [ChipFilter](ChipFilter.md) with one value.</b> A
chip filter narrows a set: pressing a second chip widens the narrowing and pressing a lit one
drops it, so a row where only one chip can be lit answers to a press differently from how it
looks. That difference is invisible until the reader presses — which is why `ChipFilter` refuses
the single-select case rather than offering a flag for it. This row is the other thing: it says
in its name, in its `role`, and to a screen reader that exactly one of these is chosen, and it
draws as pills because that is what the choice looks like.

<p><b>It is not a tab strip either.</b> A tab strip switches what a region shows and nothing is
submitted; this chooses a value the surrounding form then acts on. Where the press changes the
panel below it and nothing else, use tabs.

## Type Parameters

### T

`T` *extends* `string` \| `number` = `string`

## Parameters

### \_\_namedParameters

[`ChoiceChipsProps`](../interfaces/ChoiceChipsProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<ChoiceChips
  label={t("mfa.methodGroup")}
  value={method}
  onChange={setMethod}
  options={[
    { value: "PASSKEY", label: t("mfa.method.PASSKEY") },
    { value: "TOTP", label: t("mfa.method.TOTP"), disabled: true, disabledReason: t("mfa.unavailable.NOT_ENROLLED") },
  ]}
/>
```
