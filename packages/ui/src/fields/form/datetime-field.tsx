import { useCallback, useMemo } from "react";

import type { ReactNode } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { DatePicker } from "../../base/inputs/date-picker";
import type { DateLike } from "../../utils/parse-date";
import { parseDate } from "../../utils/parse-date";
import { asZonedInstant, decodeInstant } from "../../utils/rfc3339-date";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link DateTimeField} form component. */
export interface DateTimeFieldProps extends CommonFieldProps {
  /** Currently selected date-time. Accepts Date, ISO string, or unix timestamp. */
  value: DateLike | null;
  /** Called when the date-time changes. */
  onChange: (value: Date | null) => void;
  /** Earliest selectable date. */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
  /** Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). */
  locale?: string;
  /** Placeholder text when no date is selected. */
  placeholder?: string;
  /** Start year for the year dropdown. */
  startYear?: number;
  /** End year for the year dropdown. */
  endYear?: number;
  /** Hide time selection and act as date-only picker. @defaultValue false */
  hideTime?: boolean;
  /** Use a 12-hour clock with an AM/PM toggle. @defaultValue true */
  hour12?: boolean;
  /** Interval between minute options in the scroll column. @defaultValue 1 */
  minuteStep?: number;
  /**
   * IANA display timezone for a site-scoped `Instant` field. When set, the
   * incoming server string is decoded into the site's wall clock and the emitted
   * value is tagged (via `asZonedInstant`) so `JSON.stringify` re-encodes it in
   * this zone. The consumer must NOT `toISOString()` the resulting floating Date.
   * Ignored when {@link DateTimeFieldProps.hideTime} is set (date-only mode is
   * zone-neutral; use `DateField` for a calendar date).
   */
  displayZone?: string;
  /** Optional label shown under the picker, e.g. "Site time · Asia/Seoul". Defaults to the IANA id. */
  displayZoneLabel?: ReactNode;
}

/**
 * Date-time picker field with a popover calendar, hour/minute spinner inputs,
 * and scrollable hour/minute columns.
 *
 * @example
 * ```tsx
 * <DateTimeField
 *   label="Event Start"
 *   value={startDate}
 *   onChange={setStartDate}
 * />
 * ```
 */
export function DateTimeField({
  value,
  onChange,
  minDate,
  maxDate,
  locale,
  placeholder,
  startYear,
  endYear,
  hideTime = false,
  hour12,
  minuteStep,
  displayZone,
  displayZoneLabel,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: DateTimeFieldProps) {
  // Zone logic applies only when a time is shown; date-only mode is zone-neutral.
  const zone = hideTime ? undefined : displayZone;

  const parsed = useMemo(() => {
    if (value == null) return undefined;
    // A Date coming back from the picker is already floating; pass it through.
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
    // Server string/number → floating (display zone) or true instant (legacy).
    return zone ? decodeInstant(value, zone) : parseDate(value);
  }, [value, zone]);

  const handleChange = useCallback(
    (date: Date | undefined) => {
      if (!date) return onChange(null);
      onChange(zone ? asZonedInstant(date, zone) : date);
    },
    [onChange, zone],
  );

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      <DatePicker
        value={parsed}
        onChange={handleChange}
        minDate={minDate}
        maxDate={maxDate}
        locale={locale}
        placeholder={placeholder}
        startYear={startYear}
        endYear={endYear}
        disabled={disabled}
        showTime={!hideTime}
        hour12={hour12}
        minuteStep={minuteStep}
        displayZone={zone}
        displayZoneLabel={displayZoneLabel}
      />
    </FieldWrapper>
  );
}
