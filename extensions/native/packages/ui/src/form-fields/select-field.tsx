import { SelectSheet, type SelectOption } from "../inputs/select-sheet";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link SelectField} form component. */
export interface SelectFieldProps<T extends string = string> extends CommonFieldProps {
  /** Currently selected value. */
  value: T;
  /** Called when the selection changes. */
  onChange: (value: T) => void;
  /** Available options with label/value pairs. */
  options: Array<SelectOption<T>>;
  placeholder?: string;
}

/**
 * Single-select field over a sheet picker — the same option contract as the
 * web `SelectField`, rendered in the mobile grammar.
 */
export function SelectField<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: SelectFieldProps<T>) {
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
      <SelectSheet
        value={value || undefined}
        onChange={onChange}
        options={options}
        title={label}
        placeholder={placeholder}
        disabled={disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
