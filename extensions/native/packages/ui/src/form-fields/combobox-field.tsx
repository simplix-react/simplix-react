import { ComboboxSheet } from "../inputs/combobox-sheet";
import type { SelectOption } from "../inputs/select-sheet";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link ComboboxField} form component. */
export interface ComboboxFieldProps<T extends string = string>
  extends CommonFieldProps {
  value: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  placeholder?: string;
  /** Server-search callback; without it options filter client-side. */
  onSearchChange?: (query: string) => void;
  /** Spinner row while a server search is in flight. */
  loading?: boolean;
}

/**
 * Searchable select field over a search sheet — the same option contract as
 * the web `ComboboxField`, rendered in the mobile grammar.
 */
export function ComboboxField<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  onSearchChange,
  loading,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: ComboboxFieldProps<T>) {
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
      <ComboboxSheet
        value={value || undefined}
        onChange={onChange}
        options={options}
        title={label}
        placeholder={placeholder}
        onSearchChange={onSearchChange}
        loading={loading}
        disabled={disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
