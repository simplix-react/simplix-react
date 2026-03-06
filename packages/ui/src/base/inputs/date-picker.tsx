import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Calendar } from "../controls/calendar";
import { CalendarDotIcon, XIcon, CaretDownIcon } from "../../crud/shared/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../overlay/popover";
import { cn } from "../../utils/cn";
import {
  formatDateMedium,
  generateYears,
  getMonthNames,
  isYearFirstLocale,
  toBcp47,
} from "../../utils/format-date";

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
    <div className={cn("relative inline-flex", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-8 appearance-none rounded-md border border-input bg-background px-2 pr-6 text-sm font-medium",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <CaretDownIcon className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50" />
    </div>
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
  /** Earliest selectable date. */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
  /** Show clear button when a value is selected. @defaultValue true */
  clearable?: boolean;
  /** Disable the picker. */
  disabled?: boolean;
  /** Additional class name for the trigger button. */
  className?: string;
}

/**
 * Standalone date picker with a popover calendar and month/year dropdowns.
 *
 * @example
 * ```tsx
 * <DatePicker value={date} onChange={setDate} locale="ko" />
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
}: DatePickerProps) {
  const { t, locale: currentLocale } = useTranslation("simplix/ui");
  const locale = localeProp ?? currentLocale;
  const bcp47 = toBcp47(locale);
  const yearFirst = isYearFirstLocale(locale);
  const defaultPlaceholder = placeholder ?? t("date.pickDate");

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(value ?? new Date());

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
      onChange(date);
      setOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
    },
    [onChange],
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
            {value ? formatDateMedium(value, bcp47) : defaultPlaceholder}
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
          {/* Month/Year navigation header */}
          <div className="flex items-center justify-between gap-2 mb-2">
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
          {/* Calendar (header hidden — we provide our own) */}
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            month={viewMonth}
            onMonthChange={setViewMonth}
            minDate={minDate}
            maxDate={maxDate}
            locale={bcp47}
            hideHeader
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
