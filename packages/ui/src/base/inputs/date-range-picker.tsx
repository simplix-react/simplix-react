import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Calendar, type DateRange } from "../controls/calendar";
import { CalendarDotsIcon, XIcon, CaretDownIcon } from "../../crud/shared/icons";
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

// ── Date arithmetic helpers (no date-fns) ──

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function endOfWeek(d: Date): Date {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31);
}

function subDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n);
}

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

// ── DateRangePicker ──

/** Props for the {@link DateRangePicker} component. */
export interface DateRangePickerProps {
  /** Currently selected date range. */
  value: DateRange;
  /** Called when the range changes. */
  onChange: (range: DateRange) => void;
  /** Placeholder text when no range is selected. */
  placeholder?: string;
  /** Short locale code (e.g. `"ko"`, `"en"`, `"ja"`). Defaults to current i18n language. */
  locale?: string;
  /** Number of months to display. @defaultValue 2 */
  numberOfMonths?: 1 | 2;
  /** Years range around current year for dropdowns. @defaultValue 10 */
  yearsRange?: number;
  /** Called when reset is clicked. If not provided, onChange is called with empty range. */
  onReset?: () => void;
  /** Disable the picker. */
  disabled?: boolean;
  /** Additional class name for the trigger button. */
  className?: string;
}

/**
 * Standalone date range picker with a popover calendar, preset ranges, and month/year dropdowns.
 *
 * @example
 * ```tsx
 * <DateRangePicker value={range} onChange={setRange} locale="ko" />
 * ```
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder,
  locale: localeProp,
  numberOfMonths = 2,
  yearsRange = 10,
  onReset,
  disabled = false,
  className,
}: DateRangePickerProps) {
  const { t, locale: currentLocale } = useTranslation("simplix/ui");
  const locale = localeProp ?? currentLocale;
  const bcp47 = toBcp47(locale);
  const yearFirst = isYearFirstLocale(locale);
  const defaultPlaceholder = placeholder ?? t("date.pickDateRange");

  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customDays, setCustomDays] = useState("");

  const today = useMemo(() => new Date(), []);

  const [viewMonth, setViewMonth] = useState<Date>(value.from ?? today);

  const currentYear = today.getFullYear();
  const years = useMemo(
    () => generateYears(currentYear - Math.floor(yearsRange / 2), currentYear + Math.ceil(yearsRange / 2)),
    [currentYear, yearsRange],
  );
  const monthNames = useMemo(() => getMonthNames(locale), [locale]);

  const yearOptions = useMemo(
    () => years.map((y) => ({ value: y.toString(), label: y.toString() })),
    [years],
  );
  const monthOptions = useMemo(
    () => monthNames.map((name, i) => ({ value: i.toString(), label: name })),
    [monthNames],
  );

  // Preset date ranges
  const presets = useMemo(
    () => [
      { label: t("date.today"), from: startOfDay(today), to: endOfDay(today) },
      { label: t("date.yesterday"), from: startOfDay(subDays(today, 1)), to: endOfDay(subDays(today, 1)) },
      { label: t("date.thisWeek"), from: startOfWeek(today), to: endOfWeek(today) },
      { label: t("date.lastWeek"), from: startOfWeek(subDays(startOfWeek(today), 1)), to: endOfWeek(subDays(startOfWeek(today), 1)) },
      { label: t("date.last7Days"), from: startOfDay(subDays(today, 6)), to: endOfDay(today) },
      { label: t("date.thisMonth"), from: startOfMonth(today), to: endOfMonth(today) },
      { label: t("date.lastMonth"), from: startOfMonth(subDays(startOfMonth(today), 1)), to: endOfMonth(subDays(startOfMonth(today), 1)) },
      { label: t("date.thisYear"), from: startOfYear(today), to: endOfYear(today) },
      { label: t("date.lastYear"), from: startOfYear(subDays(startOfYear(today), 1)), to: endOfYear(subDays(startOfYear(today), 1)) },
    ],
    [t, today],
  );

  const handlePresetSelect = useCallback(
    (preset: { label: string; from: Date; to: Date }) => {
      onChange({ from: preset.from, to: preset.to });
      setSelectedPreset(preset.label);
      setViewMonth(preset.from);
    },
    [onChange],
  );

  const handleCustomDays = useCallback(() => {
    const num = parseInt(customDays);
    if (isNaN(num) || num <= 0) return;
    const from = startOfDay(subDays(today, num - 1));
    const to = endOfDay(today);
    onChange({ from, to });
    setSelectedPreset(`${t("date.recent")} ${num} ${t("date.days")}`);
    setViewMonth(from);
  }, [customDays, onChange, t, today]);

  const handleRangeSelect = useCallback(
    (range: DateRange) => {
      onChange(range);
      setSelectedPreset(null);
      if (range.from && range.to) {
        // Don't auto-close for range pickers - user may want presets
      }
    },
    [onChange],
  );

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    } else {
      onChange({ from: undefined, to: undefined });
    }
    setSelectedPreset(null);
    setCustomDays("");
    setViewMonth(today);
  }, [onChange, onReset, today]);

  const handlePrevMonth = useCallback(() => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  // Display text
  const displayText = useMemo(() => {
    if (!value.from) return null;
    if (value.from && value.to) {
      return numberOfMonths === 2
        ? `${formatDateMedium(value.from, bcp47)} – ${formatDateMedium(value.to, bcp47)}`
        : formatDateMedium(value.from, bcp47);
    }
    return `${formatDateMedium(value.from, bcp47)} – ...`;
  }, [value, bcp47, numberOfMonths]);

  const YearSelect = (
    <MonthYearSelect
      value={viewMonth.getFullYear().toString()}
      options={yearOptions}
      onChange={(v) => setViewMonth((prev) => new Date(parseInt(v), prev.getMonth(), 1))}
      className="w-[80px]"
    />
  );

  const MonthSelectEl = (
    <MonthYearSelect
      value={viewMonth.getMonth().toString()}
      options={monthOptions}
      onChange={(v) => setViewMonth((prev) => new Date(prev.getFullYear(), parseInt(v), 1))}
      className="w-[72px]"
    />
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          data-empty={!value.from}
          className={cn(
            "inline-flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarDotsIcon className="h-4 w-4 shrink-0 opacity-50" />
          <span className="flex-1 truncate text-start">
            {displayText ?? defaultPlaceholder}
          </span>
          {value.from && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  handleReset();
                }
              }}
              className="rounded-sm p-0.5 hover:bg-muted transition-colors"
            >
              <XIcon className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        style={{ maxHeight: "var(--radix-popover-content-available-height)", overflowY: "auto" }}
      >
        <div className="flex">
          {/* Presets panel (desktop only, dual month) */}
          {numberOfMonths === 2 && (
            <div className="hidden md:flex flex-col border-r p-3 w-44">
              <h4 className="text-xs font-medium mb-2">{t("date.presets")}</h4>
              <div className="grid grid-cols-2 gap-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={cn(
                      "rounded-md px-2 py-1 text-xs text-start hover:bg-primary/90 hover:text-primary-foreground",
                      selectedPreset === preset.label && "bg-primary text-primary-foreground",
                    )}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {/* Recent N days */}
              <div className="mt-3 flex items-center gap-1 rounded-md bg-muted/30 p-2">
                <span className="text-xs">{t("date.recent")}</span>
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCustomDays(); }}
                  placeholder="7"
                  className="w-14 h-6 rounded border px-1 text-center text-xs"
                  min="1"
                  max="365"
                />
                <span className="text-xs">{t("date.days")}</span>
              </div>
            </div>
          )}

          {/* Calendar area */}
          <div className="flex flex-col p-3">
            {/* Month/Year navigation */}
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
                {yearFirst ? <>{YearSelect}{MonthSelectEl}</> : <>{MonthSelectEl}{YearSelect}</>}
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

            {/* Calendar */}
            <Calendar
              mode="range"
              selectedRange={value}
              onSelectRange={handleRangeSelect}
              month={viewMonth}
              onMonthChange={setViewMonth}
              numberOfMonths={numberOfMonths}
              locale={bcp47}
              hideHeader
            />

            {/* Footer: Today / Reset / Close */}
            <div className="flex justify-between gap-2 border-t pt-2 mt-2">
              <button
                type="button"
                className="inline-flex h-7 items-center rounded-md border border-input px-2 text-xs hover:bg-accent"
                onClick={() => handlePresetSelect({ label: t("date.today"), from: startOfDay(today), to: endOfDay(today) })}
              >
                {t("date.today")}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-7 items-center rounded-md border border-input px-2 text-xs hover:bg-accent"
                  onClick={handleReset}
                >
                  {t("date.reset")}
                </button>
                <button
                  type="button"
                  className="inline-flex h-7 items-center rounded-md border border-input px-2 text-xs hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
