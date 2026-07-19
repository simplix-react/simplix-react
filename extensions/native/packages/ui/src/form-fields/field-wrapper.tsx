import { useTranslation } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Label } from "../controls/label";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import type { CommonFieldProps } from "./types";

/** Props for the {@link FieldWrapper} component. */
export interface FieldWrapperProps extends CommonFieldProps {
  children: ReactNode;
}

/**
 * Wraps a form input with label, description, and error/warning display.
 * Message priority: error > warning; description is always shown.
 */
export function FieldWrapper({
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  className,
  children,
}: FieldWrapperProps) {
  const { t } = useTranslation("simplix/native");
  const labelText = label ?? (labelKey ? t(labelKey) : undefined);
  const statusMessage = error ?? warning;

  return (
    <View className={cn("gap-1 py-1", className)}>
      {labelText ? (
        <View className="flex-row items-center gap-0.5">
          <Label>{labelText}</Label>
          {required ? <Text className="text-destructive">*</Text> : null}
        </View>
      ) : null}
      {children}
      {statusMessage ? (
        <Text size="sm" className={error ? "text-destructive" : "text-amber-600 dark:text-amber-400"}>
          {statusMessage}
        </Text>
      ) : null}
      {description ? (
        <Text size="sm" tone="muted">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
