[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / SettingSwitch

# Function: SettingSwitch()

> **SettingSwitch**(`props`): `Element`

Defined in: [packages/ui/src/base/controls/setting-switch.tsx:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/controls/setting-switch.tsx#L38)

Labeled toggle row pairing a [LabeledField](LabeledField.md) label/description with a
trailing [Switch](../variables/Switch.md). The label is wired to the switch via `htmlFor`, so
clicking the label toggles the control.

## Parameters

### props

[`SettingSwitchProps`](../interfaces/SettingSwitchProps.md)

[SettingSwitchProps](../interfaces/SettingSwitchProps.md)

## Returns

`Element`

## Example

```tsx
<SettingSwitch
  label="Email notifications"
  description="Receive a summary every morning"
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```
