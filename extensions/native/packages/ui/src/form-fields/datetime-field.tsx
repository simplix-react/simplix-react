import { NativeDateTimePicker } from "../inputs/native-date-time-picker";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link DateTimeField} form component. */
export interface DateTimeFieldProps extends CommonFieldProps {
  value: Date | null;
  onChange: (value: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  /** Use a 24-hour clock for display. */
  hour24?: boolean;
}

/**
 * Absolute-instant field over the platform-native date + time pickers.
 * Serialize with `serializeInstant` from `@simplix-react/headless` (site
 * timezone for site-scoped instants — see the semantic-kind contract).
 */
export function DateTimeField({
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder,
  hour24,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: DateTimeFieldProps) {
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
        mode="datetime"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        placeholder={placeholder}
        hour24={hour24}
        disabled={disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
