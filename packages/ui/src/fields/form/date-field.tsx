import { useCallback, useMemo } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { DatePicker } from "../../base/inputs/date-picker";
import type { DateLike } from "../../utils/parse-date";
import { asPlainDate, parseDate } from "../../utils/parse-date";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link DateField} form component. */
export interface DateFieldProps extends CommonFieldProps {
  /** Currently selected date. Accepts Date, ISO string, or unix timestamp. */
  value: DateLike | null;
  /** Called when the date selection changes. */
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
  /** Reverse year order in dropdown. */
  reverseYears?: boolean;
}

/**
 * Date picker field with calendar popover, month/year dropdowns, and i18n support.
 *
 * @example
 * ```tsx
 * <DateField
 *   label="Birth Date"
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   maxDate={new Date()}
 *   locale="ko"
 * />
 * ```
 */
export function DateField({
  value,
  onChange,
  minDate,
  maxDate,
  locale,
  placeholder,
  startYear,
  endYear,
  reverseYears,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: DateFieldProps) {
  const parsed = useMemo(() => parseDate(value), [value]);

  // DateField is the LocalDate (date-only) input: tag every picked Date so it
  // serializes as a zone-neutral yyyy-MM-dd (never UTC). Unconditional by design
  // — the date-vs-datetime distinction is the component (DateField vs DateTimeField),
  // not a runtime branch. The calendar hands us a fresh local-midnight instance
  // per selection, so in-place tagging is safe.
  const handleChange = useCallback(
    (date: Date | undefined) => onChange(date ? asPlainDate(date) : null),
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
        reverseYears={reverseYears}
        disabled={disabled}
      />
    </FieldWrapper>
  );
}
