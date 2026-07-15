import { useCallback, useMemo } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { DatePicker } from "../../base/inputs/date-picker";
import type { DateLike } from "../../utils/parse-date";
import { parseDate } from "../../utils/parse-date";
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
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: DateTimeFieldProps) {
  const parsed = useMemo(() => parseDate(value), [value]);

  const handleChange = useCallback(
    (date: Date | undefined) => {
      onChange(date ?? null);
    },
    [onChange],
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
      />
    </FieldWrapper>
  );
}
