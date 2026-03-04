import type { ComponentProps } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import type { Checkbox as CheckboxBase } from "../../base/checkbox";
import { useUIComponents } from "../../provider/ui-provider";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link CheckboxField} form component. */
export interface CheckboxFieldProps extends CommonFieldProps {
  /** Current checked state. */
  value: boolean;
  /** Called when the checked state changes. */
  onChange: (value: boolean) => void;
  /** Additional props forwarded to the underlying Checkbox element. */
  checkboxProps?: ComponentProps<typeof CheckboxBase>;
}

/**
 * Checkbox field. Defaults to `layout="left"` for natural layout.
 *
 * @example
 * ```tsx
 * <CheckboxField label="Accept terms" value={accepted} onChange={setAccepted} required />
 * ```
 */
export function CheckboxField({
  value,
  onChange,
  checkboxProps,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  layout = "left",
  ...variantProps
}: CheckboxFieldProps) {
  const { Checkbox } = useUIComponents();

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      layout={layout}
      {...variantProps}
    >
      <Checkbox
        checked={value}
        onCheckedChange={(checked) => onChange(checked === true)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-label={layout === "hidden" ? label : undefined}
        {...checkboxProps}
      />
    </FieldWrapper>
  );
}
