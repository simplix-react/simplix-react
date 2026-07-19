import type { DateRange } from "@simplix-react/headless";
import { View } from "react-native";

import { NativeDateTimePicker } from "../inputs/native-date-time-picker";
import { Text } from "../primitives/text";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link DateRangeField} form component. */
export interface DateRangeFieldProps extends CommonFieldProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

/**
 * Inclusive date range field as two native date pickers. Send boundaries as
 * picked — the exclusive-boundary shift is the server's contract.
 */
export function DateRangeField({
  value,
  onChange,
  minimumDate,
  maximumDate,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: DateRangeFieldProps) {
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
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <NativeDateTimePicker
            value={value.from ?? null}
            onChange={(from) => onChange({ ...value, from })}
            mode="date"
            minimumDate={minimumDate}
            maximumDate={value.to ?? maximumDate}
            disabled={disabled}
            invalid={!!error}
          />
        </View>
        <Text tone="muted">–</Text>
        <View className="flex-1">
          <NativeDateTimePicker
            value={value.to ?? null}
            onChange={(to) => onChange({ ...value, to })}
            mode="date"
            minimumDate={value.from ?? minimumDate}
            maximumDate={maximumDate}
            disabled={disabled}
            invalid={!!error}
          />
        </View>
      </View>
    </FieldWrapper>
  );
}
