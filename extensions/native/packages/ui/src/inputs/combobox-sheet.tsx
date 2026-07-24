import { useTranslation } from "@simplix-react/i18n/react";
import { useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { BottomSheet } from "../overlays/bottom-sheet";
import { Input } from "./input";
import {
  OptionRows,
  SelectTrigger,
  type SelectOption,
} from "./select-sheet";

/** Props for the {@link ComboboxSheet} component. */
export interface ComboboxSheetProps<T extends string = string> {
  value: T | undefined;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  /** Sheet title. */
  title?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  /**
   * Server-search callback. When provided, filtering is delegated: the query
   * is reported here and `options` are rendered as-is (pair with `loading`).
   * Without it, options are filtered client-side by label.
   */
  onSearchChange?: (query: string) => void;
  /** Shows a spinner row while a server search is in flight. */
  loading?: boolean;
  /**
   * Replaces the default input-shaped {@link SelectTrigger} — e.g. a compact
   * calling-code button. Receives the current selection and the sheet opener.
   */
  renderTrigger?: (args: {
    selected: SelectOption<T> | undefined;
    open: () => void;
  }) => ReactNode;
  className?: string;
}

/**
 * Search-sheet combobox — the mobile replacement for the web `ComboboxField`
 * popover. Opens a `BottomSheet` with a pinned search input and large
 * touch rows; supports client filtering or delegated server search.
 */
export function ComboboxSheet<T extends string = string>({
  value,
  onChange,
  options,
  title,
  placeholder,
  disabled,
  invalid,
  onSearchChange,
  loading,
  renderTrigger,
  className,
}: ComboboxSheetProps<T>) {
  const { t } = useTranslation("simplix/native");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleOptions = useMemo(() => {
    if (onSearchChange || !query) return options;
    const lower = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(lower) ||
        (o.searchText?.toLowerCase().includes(lower) ?? false),
    );
  }, [options, query, onSearchChange]);

  const selected = options.find((o) => o.value === value);

  const handleQuery = (next: string) => {
    setQuery(next);
    onSearchChange?.(next);
  };

  const openSheet = () => {
    setQuery("");
    onSearchChange?.("");
    setOpen(true);
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ selected, open: openSheet })
      ) : (
        <SelectTrigger
          displayValue={selected?.label}
          placeholder={placeholder}
          disabled={disabled}
          invalid={invalid}
          onPress={openSheet}
          className={className}
        />
      )}
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title}>
        <View className="border-b border-border px-4 pb-3">
          <Input
            value={query}
            onChangeText={handleQuery}
            placeholder={t("field.searchPlaceholder")}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled">
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator />
            </View>
          ) : (
            <OptionRows
              options={visibleOptions}
              isSelected={(v) => v === value}
              onSelect={(option) => {
                onChange(option.value);
                setOpen(false);
              }}
              emptyText={t("field.noOptions")}
            />
          )}
        </ScrollView>
      </BottomSheet>
    </>
  );
}
