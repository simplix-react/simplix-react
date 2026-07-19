import { useTranslation } from "@simplix-react/i18n/react";
import { View } from "react-native";

import { Label } from "../controls/label";
import { Switch } from "../inputs/switch";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import type { CommonFieldProps } from "./types";

/** Props for the {@link SwitchField} form component. */
export interface SwitchFieldProps extends CommonFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

/**
 * Toggle field in the settings-row style: label leading, switch trailing,
 * description and error below.
 */
export function SwitchField({
  value,
  onChange,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: SwitchFieldProps) {
  const { t } = useTranslation("simplix/native");
  const labelText = label ?? (labelKey ? t(labelKey) : undefined);
  const statusMessage = error ?? warning;

  return (
    <View className={cn("gap-1 py-1", className)}>
      <View className="min-h-11 flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-0.5">
          {labelText ? <Label>{labelText}</Label> : null}
          {required ? <Text className="text-destructive">*</Text> : null}
        </View>
        <Switch checked={value} onCheckedChange={onChange} disabled={disabled} />
      </View>
      {statusMessage ? (
        <Text
          size="sm"
          className={error ? "text-destructive" : "text-amber-600 dark:text-amber-400"}
        >
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
