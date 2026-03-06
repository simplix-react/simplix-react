import type { CommonFieldProps } from "../../crud/shared/types";
import { DateRangePicker } from "../../base/inputs/date-range-picker";
import type { DateRange } from "../../base/controls/calendar";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link DateRangeField} form component. */
export interface DateRangeFieldProps extends CommonFieldProps {
  /** Currently selected date range. */
  value: DateRange;
  /** Called when the range changes. */
  onChange: (range: DateRange) => void;
  /** Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). */
  locale?: string;
  /** Placeholder text when no range is selected. */
  placeholder?: string;
  /** Number of calendar months to display. @defaultValue 2 */
  numberOfMonths?: 1 | 2;
}

/**
 * Date range picker field with calendar popover, preset ranges, and i18n support.
 *
 * @example
 * ```tsx
 * <DateRangeField
 *   label="Period"
 *   value={range}
 *   onChange={setRange}
 *   locale="ko"
 * />
 * ```
 */
export function DateRangeField({
  value,
  onChange,
  locale,
  placeholder,
  numberOfMonths,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: DateRangeFieldProps) {
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
      <DateRangePicker
        value={value}
        onChange={onChange}
        locale={locale}
        placeholder={placeholder}
        numberOfMonths={numberOfMonths}
        disabled={disabled}
      />
    </FieldWrapper>
  );
}
