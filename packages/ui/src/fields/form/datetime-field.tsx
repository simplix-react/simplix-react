import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { DatePicker } from "../../base/inputs/date-picker";
import { useFlatUIComponents } from "../../provider/ui-provider";
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
  /** Hide time inputs and act as date-only picker. @defaultValue false */
  hideTime?: boolean;
}

/**
 * Date-time picker field with calendar popover and hour/minute inputs.
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
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: DateTimeFieldProps) {
  const { Input } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const parsed = useMemo(() => parseDate(value), [value]);

  const [hours, setHours] = useState(() =>
    parsed ? parsed.getHours().toString().padStart(2, "0") : "00",
  );
  const [minutes, setMinutes] = useState(() =>
    parsed ? parsed.getMinutes().toString().padStart(2, "0") : "00",
  );

  // Sync time when value changes externally
  useEffect(() => {
    if (parsed) {
      setHours(parsed.getHours().toString().padStart(2, "0"));
      setMinutes(parsed.getMinutes().toString().padStart(2, "0"));
    }
  }, [parsed]);

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        onChange(null);
        return;
      }
      const d = new Date(date);
      d.setHours(parseInt(hours) || 0);
      d.setMinutes(parseInt(minutes) || 0);
      d.setSeconds(0, 0);
      onChange(d);
    },
    [onChange, hours, minutes],
  );

  const handleTimeChange = useCallback(
    (newHours: string, newMinutes: string) => {
      setHours(newHours);
      setMinutes(newMinutes);
      if (parsed) {
        const d = new Date(parsed);
        d.setHours(parseInt(newHours) || 0);
        d.setMinutes(parseInt(newMinutes) || 0);
        d.setSeconds(0, 0);
        onChange(d);
      }
    },
    [parsed, onChange],
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
      <div className="flex flex-col gap-2">
        <DatePicker
          value={parsed}
          onChange={handleDateChange}
          minDate={minDate}
          maxDate={maxDate}
          locale={locale}
          placeholder={placeholder}
          startYear={startYear}
          endYear={endYear}
          disabled={disabled}
        />
        {!hideTime && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("date.hour")}</span>
            <Input
              type="text"
              inputMode="numeric"
              value={hours}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                const num = Math.min(23, Math.max(0, parseInt(val) || 0));
                handleTimeChange(num.toString().padStart(2, "0"), minutes);
              }}
              disabled={disabled}
              className="w-12 h-8 text-center px-1"
              placeholder="00"
            />
            <span className="text-muted-foreground">:</span>
            <Input
              type="text"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                const num = Math.min(59, Math.max(0, parseInt(val) || 0));
                handleTimeChange(hours, num.toString().padStart(2, "0"));
              }}
              disabled={disabled}
              className="w-12 h-8 text-center px-1"
              placeholder="00"
            />
            <span className="text-xs text-muted-foreground">{t("date.minute")}</span>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
