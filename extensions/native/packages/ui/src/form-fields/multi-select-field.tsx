import { useTranslation } from "@simplix-react/i18n/react";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button } from "../controls/button";
import { BottomSheet } from "../overlays/bottom-sheet";
import { SelectTrigger, type SelectOption } from "../inputs/select-sheet";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link MultiSelectField} form component. */
export interface MultiSelectFieldProps<T extends string = string>
  extends CommonFieldProps {
  value: T[];
  onChange: (value: T[]) => void;
  options: Array<SelectOption<T>>;
  placeholder?: string;
}

/**
 * Multi-select field over a sheet with checkbox rows and an explicit apply
 * action. The trigger summarizes the selection.
 */
export function MultiSelectField<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: MultiSelectFieldProps<T>) {
  const { t } = useTranslation("simplix/native");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T[]>(value);

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);
  const displayValue =
    selectedLabels.length === 0
      ? undefined
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : t("field.multiSelected", { count: selectedLabels.length });

  const toggle = (option: SelectOption<T>) => {
    setDraft((prev) =>
      prev.includes(option.value)
        ? prev.filter((v) => v !== option.value)
        : [...prev, option.value],
    );
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
      <SelectTrigger
        displayValue={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        invalid={!!error}
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
      />
      <BottomSheet open={open} onClose={() => setOpen(false)} title={label}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {options.map((option) => {
            const checked = draft.includes(option.value);
            return (
              <Pressable
                key={option.value}
                accessibilityRole="checkbox"
                accessibilityState={{ checked, disabled: !!option.disabled }}
                disabled={option.disabled}
                onPress={() => toggle(option)}
                className={cn(
                  "min-h-12 flex-row items-center justify-between gap-3 border-b border-border px-4 py-3 active:bg-surface-2",
                  option.disabled && "opacity-50",
                )}
              >
                <Text size="base" className={cn("flex-1", checked && "font-semibold")}>
                  {option.label}
                </Text>
                <View
                  className={cn(
                    "h-6 w-6 items-center justify-center rounded border border-input",
                    checked && "border-primary bg-primary",
                  )}
                >
                  {checked ? (
                    <Text className="text-sm font-bold text-primary-foreground">✓</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <View className="flex-row gap-2 px-4 py-3">
          <Button variant="outline" className="flex-1" onPress={() => setDraft([])}>
            {t("common.clear")}
          </Button>
          <Button
            className="flex-1"
            onPress={() => {
              onChange(draft);
              setOpen(false);
            }}
          >
            {t("common.apply")}
          </Button>
        </View>
      </BottomSheet>
    </FieldWrapper>
  );
}
