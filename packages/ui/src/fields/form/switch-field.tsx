import type { ComponentProps } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import type { Switch as SwitchBase } from "../../base/switch";
import { useUIComponents } from "../../provider/ui-provider";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link SwitchField} form component. */
export interface SwitchFieldProps extends CommonFieldProps {
  /** Current toggle state. */
  value: boolean;
  /** Called when the toggle state changes. */
  onChange: (value: boolean) => void;
  /** Additional props forwarded to the underlying Switch element. */
  switchProps?: ComponentProps<typeof SwitchBase>;
}

/**
 * Toggle switch field. Defaults to `labelPosition="left"` for natural layout.
 *
 * @example
 * ```tsx
 * <SwitchField label="Notifications" value={enabled} onChange={setEnabled} />
 * ```
 */
export function SwitchField({
  value,
  onChange,
  switchProps,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  labelPosition = "left",
  ...variantProps
}: SwitchFieldProps) {
  const { Switch } = useUIComponents();

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      labelPosition={labelPosition}
      {...variantProps}
    >
      <Switch
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-label={labelPosition === "hidden" ? label : undefined}
        {...switchProps}
      />
    </FieldWrapper>
  );
}
