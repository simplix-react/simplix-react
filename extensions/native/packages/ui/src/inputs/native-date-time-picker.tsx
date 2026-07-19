import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  formatDateShort,
  formatDateTime,
  formatWallClockTime,
} from "@simplix-react/headless";
import { useTranslation } from "@simplix-react/i18n/react";
import { useState } from "react";
import { Platform, View } from "react-native";

import { Button } from "../controls/button";
import { BottomSheet } from "../overlays/bottom-sheet";
import { SelectTrigger } from "./select-sheet";

export type DateTimePickerMode = "date" | "time" | "datetime";

/** Props for the {@link NativeDateTimePicker} component. */
export interface NativeDateTimePickerProps {
  value: Date | null;
  onChange: (value: Date) => void;
  /** Picker mode. Defaults to `"date"`. */
  mode?: DateTimePickerMode;
  minimumDate?: Date;
  maximumDate?: Date;
  /** BCP-47-resolvable locale for display formatting. Defaults to the device locale. */
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Use a 24-hour clock for time display. */
  hour24?: boolean;
  className?: string;
}

function formatValue(
  value: Date,
  mode: DateTimePickerMode,
  locale: string | undefined,
): string {
  if (mode === "time") {
    return (
      formatWallClockTime(
        { hours: value.getHours(), minutes: value.getMinutes() },
        locale,
      ) ?? ""
    );
  }
  if (mode === "datetime") return formatDateTime(value, locale);
  return formatDateShort(value, locale);
}

/**
 * Platform-native date / time picker behind an input-shaped trigger.
 *
 * Android opens the system dialogs imperatively (date, then time for
 * `"datetime"`); iOS renders the spinner picker inside a `BottomSheet`
 * with a Done action.
 */
export function NativeDateTimePicker({
  value,
  onChange,
  mode = "date",
  minimumDate,
  maximumDate,
  locale,
  placeholder,
  disabled,
  invalid,
  hour24,
  className,
}: NativeDateTimePickerProps) {
  const { t } = useTranslation("simplix/native");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const openAndroid = () => {
    const base = value ?? new Date();
    const firstMode = mode === "time" ? "time" : "date";
    DateTimePickerAndroid.open({
      value: base,
      mode: firstMode,
      minimumDate,
      maximumDate,
      is24Hour: hour24,
      onChange: (event: DateTimePickerEvent, picked?: Date) => {
        if (event.type !== "set" || !picked) return;
        if (mode === "datetime") {
          DateTimePickerAndroid.open({
            value: base,
            mode: "time",
            is24Hour: hour24,
            onChange: (timeEvent: DateTimePickerEvent, pickedTime?: Date) => {
              if (timeEvent.type !== "set" || !pickedTime) return;
              const merged = new Date(picked);
              merged.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
              onChange(merged);
            },
          });
        } else {
          onChange(picked);
        }
      },
    });
  };

  const openPicker = () => {
    if (Platform.OS === "android") {
      openAndroid();
    } else {
      setDraft(value ?? new Date());
      setSheetOpen(true);
    }
  };

  const defaultPlaceholder =
    mode === "time" ? t("field.selectTime") : t("field.selectDate");

  return (
    <>
      <SelectTrigger
        displayValue={value ? formatValue(value, mode, locale) : undefined}
        placeholder={placeholder ?? defaultPlaceholder}
        disabled={disabled}
        invalid={invalid}
        onPress={openPicker}
        className={className}
      />
      {Platform.OS !== "android" ? (
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
          <View className="items-center px-4">
            <DateTimePicker
              value={draft}
              mode={mode}
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              locale={locale}
              onChange={(_event: DateTimePickerEvent, picked?: Date) => {
                if (picked) setDraft(picked);
              }}
            />
          </View>
          <View className="px-4 pb-2 pt-1">
            <Button
              onPress={() => {
                onChange(draft);
                setSheetOpen(false);
              }}
            >
              {t("common.done")}
            </Button>
          </View>
        </BottomSheet>
      ) : null}
    </>
  );
}
