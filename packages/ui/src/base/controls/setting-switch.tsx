import { useId } from "react";

import { LabeledField } from "./labeled-field";
import { Switch } from "../inputs/switch";

export interface SettingSwitchProps {
  /** Label text rendered on the left. Already translated by the caller. */
  label: string;
  /** Optional helper text below the label. Already translated by the caller. */
  description?: string;
  /** Current toggle state. */
  checked: boolean;
  /** Fired with the next state when the user toggles the switch. */
  onCheckedChange: (checked: boolean) => void;
  /** Disables the switch when true. */
  disabled?: boolean;
  /** Explicit control id; an auto-generated id is used when omitted. */
  id?: string;
}

/**
 * Labeled toggle row pairing a {@link LabeledField} label/description with a
 * trailing {@link Switch}. The label is wired to the switch via `htmlFor`, so
 * clicking the label toggles the control.
 *
 * @param props - {@link SettingSwitchProps}
 *
 * @example
 * ```tsx
 * <SettingSwitch
 *   label="Email notifications"
 *   description="Receive a summary every morning"
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 * />
 * ```
 */
export function SettingSwitch({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  id: idProp,
}: SettingSwitchProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <LabeledField
      label={label}
      description={description}
      htmlFor={id}
      control={
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      }
    />
  );
}
