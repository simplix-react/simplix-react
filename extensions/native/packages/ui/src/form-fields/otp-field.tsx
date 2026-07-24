import { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link OtpField} form component. */
export interface OtpFieldProps extends CommonFieldProps {
  /** Current code value (digits only, at most `length` characters). */
  value: string;
  /** Called with the digit-filtered value when it changes. */
  onChange: (value: string) => void;
  /** Called once when the code reaches `length` digits. */
  onComplete?: (value: string) => void;
  /** Number of digits. Defaults to 6. */
  length?: number;
  /** Focus the input on mount. */
  autoFocus?: boolean;
}

/**
 * One-time-code input: a row of per-digit boxes backed by a single hidden
 * numeric input, so the platform number pad drives the whole code and a tap
 * anywhere on the row focuses it. Non-digits are filtered; `onComplete` fires
 * exactly when the last digit lands.
 */
export function OtpField({
  value,
  onChange,
  onComplete,
  length = 6,
  autoFocus,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: OtpFieldProps) {
  const inputRef = useRef<TextInput>(null);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, length);
    onChange(digits);
    if (digits.length === length && digits !== value) {
      onComplete?.(digits);
    }
  };

  const activeIndex = Math.min(value.length, length - 1);

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
      <Pressable
        onPress={() => inputRef.current?.focus()}
        disabled={disabled}
        accessibilityRole="none"
      >
        <View className="flex-row justify-center gap-2">
          {Array.from({ length }, (_, index) => {
            const digit = value[index] ?? "";
            const isActive = !disabled && index === activeIndex && value.length < length;
            return (
              <View
                key={index}
                className={cn(
                  "h-16 w-12 items-center justify-center rounded-md border bg-background",
                  error ? "border-destructive" : isActive ? "border-ring" : "border-input",
                  disabled && "opacity-50",
                )}
              >
                <Text font="mono" className="text-2xl">
                  {digit}
                </Text>
              </View>
            );
          })}
        </View>
        {/* Invisible full-row input — owns focus and the number pad. */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus={autoFocus}
          editable={!disabled}
          caretHidden
          contextMenuHidden
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          className="absolute inset-0 opacity-0"
        />
      </Pressable>
    </FieldWrapper>
  );
}
