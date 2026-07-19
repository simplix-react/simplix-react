import { NativeDateTimePicker } from "../inputs/native-date-time-picker";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link DateField} form component. */
export interface DateFieldProps extends CommonFieldProps {
  /** Calendar date value (time-of-day is irrelevant — see the semantic-kind contract). */
  value: Date | null;
  onChange: (value: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

/**
 * Calendar date field over the platform-native picker. Serialize with
 * `serializeCalendarDate` from `@simplix-react/headless` — never local
 * midnight plus the browser offset.
 */
export function DateField({
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: DateFieldProps) {
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
      <NativeDateTimePicker
        value={value}
        onChange={onChange}
        mode="date"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        placeholder={placeholder}
        disabled={disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
