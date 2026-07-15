import type { CommonFieldProps } from "../../crud/shared/types";
import { TimePicker } from "../../base/inputs/time-picker";
import type { TimeValue } from "../../utils/time-select";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link TimeField} form component. */
export interface TimeFieldProps extends CommonFieldProps {
  /** Currently selected time of day. */
  value: TimeValue | null;
  /** Called with the new time on every change. */
  onChange: (value: TimeValue) => void;
  /** Use a 12-hour clock with an AM/PM toggle. @defaultValue true */
  hour12?: boolean;
  /** Interval between minute options in the option list. @defaultValue 1 */
  minuteStep?: number;
  /** Earliest selectable time. */
  minTime?: TimeValue;
  /** Latest selectable time. */
  maxTime?: TimeValue;
}

/**
 * Time-of-day picker field: hour/minute spinner inputs with an AM/PM toggle
 * and drop-open option lists, wrapped with label/error/description.
 *
 * @example
 * ```tsx
 * <TimeField
 *   label="Opening Time"
 *   value={openTime}
 *   onChange={setOpenTime}
 *   minuteStep={5}
 * />
 * ```
 */
export function TimeField({
  value,
  onChange,
  hour12,
  minuteStep,
  minTime,
  maxTime,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: TimeFieldProps) {
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
      <TimePicker
        value={value ?? undefined}
        onChange={onChange}
        hour12={hour12}
        minuteStep={minuteStep}
        minTime={minTime}
        maxTime={maxTime}
        disabled={disabled}
      />
    </FieldWrapper>
  );
}
