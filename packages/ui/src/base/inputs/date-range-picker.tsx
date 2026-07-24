import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Calendar, type DateRange } from "../controls/calendar";
import { CalendarDotsIcon, XIcon } from "../../crud/shared/icons";
import { MOBILE_MEDIA_QUERY, ResponsivePopover } from "../overlay/responsive-popover";
import { useMediaQuery } from "../../hooks/use-media-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "../../utils/cn";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "../../utils/date-math";
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
  /** Called when the field is cleared via the trigger's clear button. If not provided, onChange is called with an empty range. */
  onReset?: () => void;
  /** Disable the picker. */
  disabled?: boolean;
  /** Additional class name for the trigger button. */
  className?: string;
}

/**
 * Standalone date range picker with a popover calendar, preset ranges, and month/year dropdowns.
 *
 * Range and preset picks edit a pending draft: they reach
 * {@link DateRangePickerProps.onChange} only when the user presses Select, and
 * Close (or an outside click) discards them. Reset clears the pending draft,
 * while the trigger's clear button clears the field immediately.
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

  // On mobile the overlay centers as a dialog and a two-month layout cannot fit,
  // so fall back to a single visible calendar there.
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const visibleMonths = isMobile ? 1 : numberOfMonths;

  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);

  // Draft holds the pending range inside the popover. It reaches the field
  // (via onChange) only when the user presses Select; closing via Close or an
  // outside click discards it.
  const [draft, setDraft] = useState<DateRange>(value);
  const [viewMonth, setViewMonth] = useState<Date>(value.from ?? today);

  // Reset the draft to the committed value each time the popover opens.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setDraft(value);
        setSelectedPreset(null);
        setViewMonth(value.from ?? today);
      }
      setOpen(next);
    },
    [value, today],
  );

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

  // Preset date ranges grouped by unit (day / week / month+year)
  const presetGroups = useMemo(
    () => [
      [
        { label: t("date.today"), from: startOfDay(today), to: endOfDay(today) },
        { label: t("date.yesterday"), from: startOfDay(subDays(today, 1)), to: endOfDay(subDays(today, 1)) },
        { label: t("date.last3Days"), from: startOfDay(subDays(today, 2)), to: endOfDay(today) },
        { label: t("date.last7Days"), from: startOfDay(subDays(today, 6)), to: endOfDay(today) },
        { label: t("date.last15Days"), from: startOfDay(subDays(today, 14)), to: endOfDay(today) },
      ],
      [
        { label: t("date.thisWeek"), from: startOfWeek(today), to: endOfWeek(today) },
        { label: t("date.lastWeek"), from: startOfWeek(subDays(startOfWeek(today), 1)), to: endOfWeek(subDays(startOfWeek(today), 1)) },
      ],
      [
        { label: t("date.thisMonth"), from: startOfMonth(today), to: endOfMonth(today) },
        { label: t("date.lastMonth"), from: startOfMonth(subDays(startOfMonth(today), 1)), to: endOfMonth(subDays(startOfMonth(today), 1)) },
      ],
      [
        { label: t("date.thisYear"), from: startOfYear(today), to: endOfYear(today) },
        { label: t("date.lastYear"), from: startOfYear(subDays(startOfYear(today), 1)), to: endOfYear(subDays(startOfYear(today), 1)) },
      ],
    ],
    [t, today],
  );

  const handlePresetSelect = useCallback(
    (preset: { label: string; from: Date; to: Date }) => {
      setDraft({ from: preset.from, to: preset.to });
      setSelectedPreset(preset.label);
      setViewMonth(preset.from);
    },
    [],
  );

  const handleRangeSelect = useCallback((range: DateRange) => {
    setDraft(range);
    setSelectedPreset(null);
  }, []);

  // Footer "Reset": clears the pending selection only (no commit).
  const handleResetDraft = useCallback(() => {
    setDraft({ from: undefined, to: undefined });
    setSelectedPreset(null);
    setViewMonth(today);
  }, [today]);

  // Trigger clear (X): clears the committed field immediately.
  const handleClearField = useCallback(() => {
    if (onReset) {
      onReset();
    } else {
      onChange({ from: undefined, to: undefined });
    }
    setOpen(false);
  }, [onChange, onReset]);

  // Commit the draft to the field and close.
  const handleCommit = useCallback(() => {
    onChange(draft);
    setOpen(false);
  }, [onChange, draft]);

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

  // Inclusive number of days in the pending (draft) range
  const dayCount = useMemo(() => {
    if (!draft.from || !draft.to) return null;
    const from = new Date(draft.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(draft.to);
    to.setHours(0, 0, 0, 0);
    return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  }, [draft]);

  // The second calendar always shows the month after the first
  const secondViewMonth = useMemo(
    () => new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
    [viewMonth],
  );

  const renderMonthYear = (
    month: Date,
    onMonthChange: (value: string) => void,
    onYearChange: (value: string) => void,
  ) => {
    const yearSelect = (
      <MonthYearSelect
        value={month.getFullYear().toString()}
        options={yearOptions}
        onChange={onYearChange}
        className="w-[80px]"
      />
    );
    const monthSelect = (
      <MonthYearSelect
        value={month.getMonth().toString()}
        options={monthOptions}
        onChange={onMonthChange}
        className="w-[72px]"
      />
    );
    return yearFirst ? <>{yearSelect}{monthSelect}</> : <>{monthSelect}{yearSelect}</>;
  };

  return (
    <ResponsivePopover
      open={open}
      onOpenChange={handleOpenChange}
      title={defaultPlaceholder}
      trigger={
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
              onClick={(e) => { e.stopPropagation(); handleClearField(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  handleClearField();
                }
              }}
              className="rounded-sm p-0.5 hover:bg-muted transition-colors"
            >
              <XIcon className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
            </span>
          )}
        </button>
      }
    >
      <div className="flex">
          {/* Presets panel (desktop only, dual month) */}
          {visibleMonths === 2 && (
            <div className="hidden md:flex flex-col border-r">
              <div className="px-3 pt-3 pb-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("date.presets")}</h4>
              </div>
              <div className="flex flex-col px-1.5 pb-2 overflow-y-auto min-h-0 flex-1">
                {presetGroups.map((group, gi) => (
                  <div key={gi}>
                    {gi > 0 && <div className="border-t mx-1.5 my-1" />}
                    <div className="grid grid-cols-2 gap-0.5">
                      {group.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className={cn(
                            "rounded-md px-2 py-1 text-xs text-start whitespace-nowrap transition-colors shrink-0",
                            selectedPreset === preset.label
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-foreground hover:bg-accent",
                          )}
                          onClick={() => handlePresetSelect(preset)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar area */}
          <div className="flex flex-col p-3">
            {/* Month/Year navigation — one select pair per visible calendar */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </button>
              <div className="flex flex-1 items-center justify-center gap-1">
                {renderMonthYear(
                  viewMonth,
                  (v) => setViewMonth((prev) => new Date(prev.getFullYear(), parseInt(v), 1)),
                  (v) => setViewMonth((prev) => new Date(parseInt(v), prev.getMonth(), 1)),
                )}
              </div>
              {visibleMonths === 2 && (
                <div className="flex flex-1 items-center justify-center gap-1">
                  {renderMonthYear(
                    secondViewMonth,
                    // The first calendar follows: keep it one month behind the second
                    (v) => setViewMonth(new Date(secondViewMonth.getFullYear(), parseInt(v) - 1, 1)),
                    (v) => setViewMonth(new Date(parseInt(v), secondViewMonth.getMonth() - 1, 1)),
                  )}
                </div>
              )}
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
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
              selectedRange={draft}
              onSelectRange={handleRangeSelect}
              month={viewMonth}
              onMonthChange={setViewMonth}
              numberOfMonths={visibleMonths}
              locale={bcp47}
              hideHeader
            />

            {/* Range summary: start / end / day count (reflects the pending draft) */}
            {draft.from && (
              <div className="mt-2 flex items-center justify-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">{t("date.startDate")}</span>
                <span className="font-medium">{formatDateMedium(draft.from, bcp47)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-muted-foreground">{t("date.endDate")}</span>
                <span className="font-medium">
                  {draft.to ? formatDateMedium(draft.to, bcp47) : "..."}
                </span>
                {dayCount != null && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
                    {t("date.daysCount", { count: dayCount })}
                  </span>
                )}
              </div>
            )}

            {/* Footer: Today / Reset (draft) / Close (discard) / Select (commit) */}
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
                  onClick={handleResetDraft}
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
                <button
                  type="button"
                  className="inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  onClick={handleCommit}
                >
                  {t("common.select")}
                </button>
              </div>
            </div>
          </div>
      </div>
    </ResponsivePopover>
  );
}
