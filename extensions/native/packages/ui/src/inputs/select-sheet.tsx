import { useTranslation } from "@simplix-react/i18n/react";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { BottomSheet } from "../overlays/bottom-sheet";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Option entry for {@link SelectSheet} / {@link ComboboxSheet}. */
export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
  /** Secondary line under the label. */
  description?: string;
  /**
   * Extra text matched by {@link ComboboxSheet} client-side filtering in
   * addition to the label (e.g. a country's English name and calling code).
   */
  searchText?: string;
}

/** Props for the {@link SelectTrigger} building block. */
export interface SelectTriggerProps {
  /** Display label of the current selection. */
  displayValue?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  onPress: () => void;
  className?: string;
}

/** Input-shaped trigger that opens a picker sheet. */
export function SelectTrigger({
  displayValue,
  placeholder,
  disabled,
  invalid,
  onPress,
  className,
}: SelectTriggerProps) {
  const { t } = useTranslation("simplix/native");

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "h-11 w-full flex-row items-center justify-between rounded-md border border-input bg-background px-3",
        invalid && "border-destructive",
        disabled && "opacity-50",
        className,
      )}
    >
      <Text
        size="base"
        tone={displayValue ? "default" : "muted"}
        numberOfLines={1}
        className="flex-1"
      >
        {displayValue ?? placeholder ?? t("field.selectPlaceholder")}
      </Text>
      <Text tone="muted">▾</Text>
    </Pressable>
  );
}

/** Row list shared by the picker sheets. */
export function OptionRows<T extends string = string>({
  options,
  isSelected,
  onSelect,
  emptyText,
}: {
  options: Array<SelectOption<T>>;
  isSelected: (value: T) => boolean;
  onSelect: (option: SelectOption<T>) => void;
  emptyText: string;
}) {
  if (options.length === 0) {
    return (
      <View className="items-center py-8">
        <Text size="sm" tone="muted">
          {emptyText}
        </Text>
      </View>
    );
  }

  return (
    <>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="menuitem"
            accessibilityState={{ selected, disabled: !!option.disabled }}
            disabled={option.disabled}
            onPress={() => onSelect(option)}
            className={cn(
              "min-h-12 flex-row items-center justify-between gap-3 border-b border-border px-4 py-3 active:bg-surface-2",
              option.disabled && "opacity-50",
            )}
          >
            <View className="flex-1 gap-0.5">
              <Text size="base" className={cn(selected && "font-semibold text-primary")}>
                {option.label}
              </Text>
              {option.description ? (
                <Text size="sm" tone="muted">
                  {option.description}
                </Text>
              ) : null}
            </View>
            {selected ? <Text className="text-primary">✓</Text> : null}
          </Pressable>
        );
      })}
    </>
  );
}

/** Props for the {@link SelectSheet} component. */
export interface SelectSheetProps<T extends string = string> {
  value: T | undefined;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  /** Sheet title; also announced for accessibility. */
  title?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Extra content rendered above the option list inside the sheet. */
  header?: ReactNode;
  className?: string;
}

/**
 * Sheet-style single select — the mobile replacement for the web popover
 * `SelectField` control. The trigger is input-shaped; options open in a
 * `BottomSheet` with large touch rows.
 */
export function SelectSheet<T extends string = string>({
  value,
  onChange,
  options,
  title,
  placeholder,
  disabled,
  invalid,
  header,
  className,
}: SelectSheetProps<T>) {
  const { t } = useTranslation("simplix/native");
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <SelectTrigger
        displayValue={selected?.label}
        placeholder={placeholder}
        disabled={disabled}
        invalid={invalid}
        onPress={() => setOpen(true)}
        className={className}
      />
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title}>
        {header}
        <ScrollView keyboardShouldPersistTaps="handled">
          <OptionRows
            options={options}
            isSelected={(v) => v === value}
            onSelect={(option) => {
              onChange(option.value);
              setOpen(false);
            }}
            emptyText={t("field.noOptions")}
          />
        </ScrollView>
      </BottomSheet>
    </>
  );
}
