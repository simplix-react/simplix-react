import { useTranslation } from "@simplix-react/i18n/react";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Input } from "../inputs/input";
import { Text } from "../primitives/text";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link PasswordField} form component. */
export interface PasswordFieldProps extends CommonFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Password field with a visibility toggle. */
export function PasswordField({
  value,
  onChange,
  placeholder,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: PasswordFieldProps) {
  const { t } = useTranslation("simplix/native");
  const [visible, setVisible] = useState(false);

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
      <View className="relative">
        <Input
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          invalid={!!error}
          className="pr-16"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 min-w-14 items-center justify-center px-2"
        >
          <Text size="sm" tone="muted">
            {visible ? t("field.hide") : t("field.show")}
          </Text>
        </Pressable>
      </View>
    </FieldWrapper>
  );
}
