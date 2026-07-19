import type { TimeValue } from "@simplix-react/headless";

import { NativeDateTimePicker } from "../inputs/native-date-time-picker";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link TimeField} form component. */
export interface TimeFieldProps extends CommonFieldProps {
  /** Wall-clock time value; `null` renders the placeholder. */
  value: TimeValue | null;
  onChange: (value: TimeValue) => void;
  placeholder?: string;
  /** Use a 24-hour clock. Defaults to the 12-hour clock. */
  hour24?: boolean;
}

function timeValueToDate(value: TimeValue): Date {
  const d = new Date();
  d.setHours(value.hours, value.minutes, 0, 0);
  return d;
}

/**
 * Wall-clock time field speaking `TimeValue` (`{hours, minutes}`) — the same
 * contract as the web `TimeField`. Convert to/from the DTO's `"HH:mm"` with
 * `serializeWallClockTime` / `decodeWallClockTime` from
 * `@simplix-react/headless`. An optional time needs an explicit gate
 * (a mode select or switch) — the native picker has no empty state.
 */
export function TimeField({
  value,
  onChange,
  placeholder,
  hour24,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: TimeFieldProps) {
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
      <NativeDateTimePicker
        value={value ? timeValueToDate(value) : null}
        onChange={(picked) =>
          onChange({ hours: picked.getHours(), minutes: picked.getMinutes() })
        }
        mode="time"
        placeholder={placeholder}
        hour24={hour24}
        disabled={disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
