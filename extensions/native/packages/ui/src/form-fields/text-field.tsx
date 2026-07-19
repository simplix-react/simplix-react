import type { TextInputProps } from "react-native";

import { Input } from "../inputs/input";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link TextField} form component. */
export interface TextFieldProps extends CommonFieldProps {
  /** Current input value. */
  value: string;
  /** Called when the value changes. */
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** Semantic input type — selects the platform keyboard. Defaults to `"text"`. */
  type?: "text" | "email" | "url" | "tel";
  /** Additional props forwarded to the underlying `TextInput`. */
  inputProps?: TextInputProps;
}

const KEYBOARD_BY_TYPE: Record<string, TextInputProps["keyboardType"]> = {
  text: "default",
  email: "email-address",
  url: "url",
  tel: "phone-pad",
};

/** Text input field with label, error, and description support. */
export function TextField({
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  inputProps,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: TextFieldProps) {
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
        onChangeText={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        keyboardType={KEYBOARD_BY_TYPE[type]}
        autoCapitalize={type === "email" || type === "url" ? "none" : undefined}
        editable={!disabled}
        invalid={!!error}
        {...inputProps}
      />
    </FieldWrapper>
  );
}
