import { Checkbox } from "../inputs/checkbox";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link CheckboxField} form component. */
export interface CheckboxFieldProps extends Omit<CommonFieldProps, "label"> {
  value: boolean;
  onChange: (value: boolean) => void;
  /** Tappable label rendered next to the box. */
  label?: string;
}

/** Checkbox field — the label sits beside the box, tappable as one row. */
export function CheckboxField({
  value,
  onChange,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: CheckboxFieldProps) {
  return (
    <FieldWrapper
      labelKey={label ? undefined : labelKey}
      error={error}
      warning={warning}
      description={description}
      required={required}
      className={className}
    >
      <Checkbox
        checked={value}
        onCheckedChange={onChange}
        label={label}
        disabled={disabled}
      />
    </FieldWrapper>
  );
}
