import { useTranslation } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";
import { View } from "react-native";

import { EmptyValue } from "../controls/empty-value";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Shared props for all detail (read-only) field components. */
export interface CommonDetailFieldProps {
  label?: string;
  /** i18n key rendered when `label` is absent. */
  labelKey?: string;
  className?: string;
}

/** Props for the generic {@link DetailField} row shell. */
export interface DetailFieldProps extends CommonDetailFieldProps {
  /** Value content; nullish renders the muted em dash. */
  children?: ReactNode;
}

/**
 * Read-only field row: muted label above the value. All `DetailFields.*`
 * variants render through this shell; nullish content shows `—`.
 */
export function DetailField({ label, labelKey, className, children }: DetailFieldProps) {
  const { t } = useTranslation("simplix/native");
  const labelText = label ?? (labelKey ? t(labelKey) : undefined);

  return (
    <View className={cn("gap-0.5 py-1.5", className)}>
      {labelText ? (
        <Text size="caption" tone="muted" className="font-medium uppercase">
          {labelText}
        </Text>
      ) : null}
      {children == null || children === "" ? (
        <EmptyValue />
      ) : typeof children === "string" || typeof children === "number" ? (
        <Text size="base">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
