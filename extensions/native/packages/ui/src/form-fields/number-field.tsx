import { NumberInput } from "../inputs/number-input";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link NumberField} form component. */
export interface NumberFieldProps extends CommonFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  /** Allow decimal input. Defaults to `true`. */
  decimal?: boolean;
}

/** Numeric field speaking `number | null`. */
export function NumberField({
  value,
  onChange,
  placeholder,
  decimal,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: NumberFieldProps) {
  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      warning={warning}
      description={description}
      required={required}
      className={className}
    >
      <NumberInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        decimal={decimal}
        editable={!disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
