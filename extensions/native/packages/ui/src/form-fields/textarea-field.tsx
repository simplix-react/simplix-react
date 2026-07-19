import type { TextInputProps } from "react-native";

import { Textarea } from "../inputs/textarea";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link TextareaField} form component. */
export interface TextareaFieldProps extends CommonFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** Visible line hint — sets the minimum height. */
  rows?: number;
  inputProps?: TextInputProps;
}

/** Multi-line text field with label, error, and description support. */
export function TextareaField({
  value,
  onChange,
  placeholder,
  maxLength,
  rows,
  inputProps,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: TextareaFieldProps) {
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
      <Textarea
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        numberOfLines={rows}
        style={rows ? { minHeight: rows * 24 + 16 } : undefined}
        editable={!disabled}
        invalid={!!error}
        {...inputProps}
      />
    </FieldWrapper>
  );
}
