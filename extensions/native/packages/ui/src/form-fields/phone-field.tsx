import { AsYouType, type CountryCode } from "libphonenumber-js";

import { Input } from "../inputs/input";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link PhoneField} form component. */
export interface PhoneFieldProps extends CommonFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Default region for national-format input (e.g. `"KR"`). */
  defaultCountry?: CountryCode;
  placeholder?: string;
}

/**
 * Phone number field with as-you-type formatting (libphonenumber-js).
 * The value is the formatted string as displayed; parse/validate on submit
 * with `parsePhoneNumberFromString` where E.164 is required.
 */
export function PhoneField({
  value,
  onChange,
  defaultCountry,
  placeholder,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: PhoneFieldProps) {
  const handleChange = (next: string) => {
    // Reformatting a shrinking string fights deletion — only format on growth.
    if (next.length > value.length) {
      onChange(new AsYouType(defaultCountry).input(next));
    } else {
      onChange(next);
    }
  };

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
      <Input
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        keyboardType="phone-pad"
        editable={!disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
