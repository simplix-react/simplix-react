import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Calendar } from "../controls";
import { CalendarDotIcon, XIcon } from "../../crud/shared/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../overlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { TimeSelectControl } from "./time-picker";
import { cn } from "../../utils/cn";
import {
  formatDateMedium,
  formatDateTime,
  generateYears,
  getMonthNames,
  isYearFirstLocale,
  toBcp47,
} from "../../utils/format-date";
import {
  clampToRange,
  isHourDisabled,
  isMinuteDisabled,
  withTime,
} from "../../utils/time-select";

// ── MonthYearSelect (internal) ──

function MonthYearSelect({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-8 gap-1 text-sm font-medium", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── DatePicker ──

/** Props for the {@link DatePicker} component. */
export interface DatePickerProps {
  /** Currently selected date. */
  value: Date | undefined;
  /** Called when the date changes. */
  onChange: (date: Date | undefined) => void;
  /** Placeholder text when no date is selected. */
  placeholder?: string;
  /** Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). Defaults to current i18n language. */
  locale?: string;
  /** Start year for the year dropdown. @defaultValue current year - 10 */
  startYear?: number;
  /** End year for the year dropdown. @defaultValue current year + 10 */
  endYear?: number;
  /** Reverse year order in dropdown. */
  reverseYears?: boolean;
  /** Earliest selectable date. When it carries a time of day, hour/minute options outside the range are disabled. */
  minDate?: Date;
  /** Latest selectable date. When it carries a time of day, hour/minute options outside the range are disabled. */
  maxDate?: Date;
  /** Show clear button when a value is selected. @defaultValue true */
  clearable?: boolean;
  /** Disable the picker. */
  disabled?: boolean;
  /** Additional class name for the trigger button. */
  className?: string;
  /**
   * Show time selection: an hour/minute spinner input row under the calendar.
   * Focusing the hour or minute box drops a scrollable option list open.
   * Selecting a day keeps the popover open so the time can be adjusted.
   * @defaultValue false
   */
  showTime?: boolean;
  /**
   * Use a 12-hour clock with an AM/PM toggle. Set to `false` for a 24-hour
   * clock (the toggle is hidden and the hour list shows 0-23).
   * Only applies when {@link DatePickerProps.showTime} is enabled.
   * @defaultValue true
   */
  hour12?: boolean;
  /**
   * Interval between minute options in the option list. Direct input and
   * the spinner still accept any minute.
   * Only applies when {@link DatePickerProps.showTime} is enabled.
   * @defaultValue 1
   */
  minuteStep?: number;
}

/**
 * Standalone date picker with a popover calendar and month/year dropdowns.
 * With {@link DatePickerProps.showTime} it also renders an hour/minute
 * spinner input row (with AM/PM toggle) whose fields drop scrollable
 * option lists open on focus.
 *
 * @example
 * ```tsx
 * <DatePicker value={date} onChange={setDate} locale="ko" showTime />
 * ```
 */
export function DatePicker({
  value,
  onChange,
  placeholder,
  locale: localeProp,
  startYear = new Date().getFullYear() - 10,
  endYear = new Date().getFullYear() + 10,
  reverseYears = false,
  minDate,
  maxDate,
  clearable = true,
  disabled = false,
  className,
  showTime = false,
  hour12 = true,
  minuteStep = 1,
}: DatePickerProps) {
  const { t, locale: currentLocale } = useTranslation("simplix/ui");
  const locale = localeProp ?? currentLocale;
  const bcp47 = toBcp47(locale);
  const yearFirst = isYearFirstLocale(locale);
  const defaultPlaceholder = placeholder ?? t(showTime ? "date.pickDateTime" : "date.pickDate");

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(value ?? new Date());
  const [hours, setHours] = useState(() => value?.getHours() ?? 0);
  const [minutes, setMinutes] = useState(() => value?.getMinutes() ?? 0);

  // Sync time state when value changes externally
  useEffect(() => {
    if (value) {
      setHours(value.getHours());
      setMinutes(value.getMinutes());
    }
  }, [value]);

  const years = useMemo(() => generateYears(startYear, endYear, reverseYears), [startYear, endYear, reverseYears]);
  const monthNames = useMemo(() => getMonthNames(locale), [locale]);

  const yearOptions = useMemo(
    () => years.map((y) => ({ value: y.toString(), label: y.toString() })),
    [years],
  );

  const monthOptions = useMemo(
    () => monthNames.map((name, i) => ({ value: i.toString(), label: name })),
    [monthNames],
  );

  const handlePrevMonth = useCallback(() => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleYearChange = useCallback((year: string) => {
    setViewMonth((prev) => new Date(parseInt(year), prev.getMonth(), 1));
  }, []);

  const handleMonthChange = useCallback((monthIndex: string) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), parseInt(monthIndex), 1));
  }, []);

  const handleSelect = useCallback(
    (date: Date) => {
      if (showTime) {
        // Keep the popover open so the time can still be adjusted
        onChange(clampToRange(withTime(date, hours, minutes), minDate, maxDate));
        return;
      }
      onChange(date);
      setOpen(false);
    },
    [onChange, showTime, hours, minutes, minDate, maxDate],
  );

  const commitTime = useCallback(
    (h24: number, m: number) => {
      setHours(h24);
      setMinutes(m);
      if (value) {
        onChange(clampToRange(withTime(value, h24, m), minDate, maxDate));
      }
    },
    [value, onChange, minDate, maxDate],
  );

  const handleNow = useCallback(() => {
    const now = clampToRange(new Date(), minDate, maxDate);
    now.setSeconds(0, 0);
    setViewMonth(now);
    onChange(now);
  }, [onChange, minDate, maxDate]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
    },
    [onChange],
  );

  // The calendar compares day cells at midnight, so a minDate carrying a time
  // of day would disable its own day. Floor it for day-level comparison.
  const calendarMinDate = useMemo(() => {
    if (!showTime || !minDate) return minDate;
    const d = new Date(minDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [showTime, minDate]);

  const hourDisabledInDay = useCallback(
    (hour24: number) => (value ? isHourDisabled(value, hour24, minDate, maxDate) : false),
    [value, minDate, maxDate],
  );

  const minuteDisabledInDay = useCallback(
    (hour24: number, minute: number) =>
      value ? isMinuteDisabled(value, hour24, minute, minDate, maxDate) : false,
    [value, minDate, maxDate],
  );

  const YearSelect = (
    <MonthYearSelect
      value={viewMonth.getFullYear().toString()}
      options={yearOptions}
      onChange={handleYearChange}
      className="w-[80px]"
    />
  );

  const MonthSelect = (
    <MonthYearSelect
      value={viewMonth.getMonth().toString()}
      options={monthOptions}
      onChange={handleMonthChange}
      className="w-[72px]"
    />
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            "inline-flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarDotIcon className="h-4 w-4 shrink-0 opacity-50" />
          <span className="flex-1 truncate text-start">
            {value
              ? showTime
                ? formatDateTime(value, bcp47)
                : formatDateMedium(value, bcp47)
              : defaultPlaceholder}
          </span>
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClear(e as unknown as React.MouseEvent);
              }}
              className="rounded-sm p-0.5 hover:bg-muted transition-colors"
            >
              <XIcon className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Header: month/year navigation + optional time inputs */}
          <div className="mb-2 flex items-center gap-3">
            <div className="flex flex-1 items-center justify-between gap-2">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </button>
              <div className="flex items-center gap-1">
                {yearFirst ? (
                  <>{YearSelect}{MonthSelect}</>
                ) : (
                  <>{MonthSelect}{YearSelect}</>
                )}
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.56501 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          {/* Calendar (header hidden — we provide our own) */}
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            month={viewMonth}
            onMonthChange={setViewMonth}
            minDate={calendarMinDate}
            maxDate={maxDate}
            locale={bcp47}
            hideHeader
          />
          {/* Time input under the calendar; focusing hour or minute drops its option list open.
              The lists drop UP over the calendar: the popover ends right below the time
              input, so opening downward would escape the popover and the viewport. */}
          {showTime && (
            <TimeSelectControl
              hours={hours}
              minutes={minutes}
              onCommit={commitTime}
              hour12={hour12}
              minuteStep={minuteStep}
              isHourDisabled={hourDisabledInDay}
              isMinuteDisabled={minuteDisabledInDay}
              dropDirection="up"
              className="mt-2"
            />
          )}
          {showTime && (
            <div className="mt-2 flex justify-end border-t border-input pt-2">
              <button
                type="button"
                onClick={handleNow}
                className="inline-flex h-7 items-center rounded-md px-2 text-xs hover:bg-accent hover:text-accent-foreground"
              >
                {t("date.now")}
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
