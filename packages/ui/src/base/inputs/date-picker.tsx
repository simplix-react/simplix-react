import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Calendar } from "../controls";
import { CalendarDotIcon, XIcon } from "../../crud/shared/icons";
import { ResponsivePopover } from "../overlay/responsive-popover";
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
import { decodeInstant } from "../../utils/rfc3339-date";

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
  /**
   * IANA display timezone. When set, the picker treats its value's local fields
   * as this zone's wall clock and renders a zone label; `Now` and the default
   * view month use this zone's clock.
   *
   * @remarks
   * The incoming `value` must be a FLOATING `Date` whose local fields are the
   * display-zone wall clock (produced by the parent via `decodeInstant`). When
   * `displayZone` is set, `minDate`/`maxDate` should likewise be passed as
   * floating Dates in the same zone (or left undefined); mixing a floating value
   * with a true-instant bound compares misaligned clocks.
   */
  displayZone?: string;
  /** Optional label shown under the calendar, e.g. "Site time · Asia/Seoul". Defaults to the IANA id. */
  displayZoneLabel?: React.ReactNode;
}

/**
 * Standalone date picker with a popover calendar and month/year dropdowns.
 * With {@link DatePickerProps.showTime} it also renders an hour/minute
 * spinner input row (with AM/PM toggle) whose fields drop scrollable
 * option lists open on focus.
 *
 * The calendar and time inputs edit a pending draft: a pick reaches
 * {@link DatePickerProps.onChange} only when the user presses Select, and
 * Close (or an outside click) discards it. The trigger's clear button still
 * clears the field immediately.
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
  displayZone,
  displayZoneLabel,
}: DatePickerProps) {
  const { t, locale: currentLocale } = useTranslation("simplix/ui");
  const locale = localeProp ?? currentLocale;
  const bcp47 = toBcp47(locale);
  const yearFirst = isYearFirstLocale(locale);
  const defaultPlaceholder = placeholder ?? t(showTime ? "date.pickDateTime" : "date.pickDate");

  // Default view month: the display zone's current wall clock when zoned, else now.
  const defaultView = useCallback(
    () => (displayZone ? decodeInstant(new Date(), displayZone) ?? new Date() : new Date()),
    [displayZone],
  );

  // Draft pre-selected when the field has no value: today, floored to the start
  // of the day and clamped into [minDate, maxDate]. Display-zone aware.
  const defaultDraft = useCallback(() => {
    const today = defaultView();
    today.setHours(0, 0, 0, 0);
    return clampToRange(today, minDate, maxDate);
  }, [defaultView, minDate, maxDate]);

  const [open, setOpen] = useState(false);
  // Draft holds the pending selection inside the popover. It is copied to the
  // field (via onChange) only when the user presses Select; closing via Close
  // or an outside click discards it.
  const [draft, setDraft] = useState<Date | undefined>(value);
  const [viewMonth, setViewMonth] = useState<Date>(() => value ?? defaultView());
  const [hours, setHours] = useState(() => value?.getHours() ?? 0);
  const [minutes, setMinutes] = useState(() => value?.getMinutes() ?? 0);

  // Reset the draft to the committed value each time the popover opens, so a
  // previously abandoned edit never leaks into the next session.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        // With no committed value, pre-select today so the calendar opens with
        // the current date highlighted and Select immediately enabled.
        const initialDraft = value ?? defaultDraft();
        setDraft(initialDraft);
        setHours(value?.getHours() ?? 0);
        setMinutes(value?.getMinutes() ?? 0);
        setViewMonth(initialDraft);
      }
      setOpen(next);
    },
    [value, defaultDraft],
  );

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

  const handleSelect = useCallback((date: Date) => {
    // Stage the pick; it reaches the field only when Select is pressed.
    setDraft(date);
  }, []);

  const commitTime = useCallback((h24: number, m: number) => {
    setHours(h24);
    setMinutes(m);
  }, []);

  const handleNow = useCallback(() => {
    // When zoned, produce a floating now (local fields = display-zone wall clock).
    const now = clampToRange(defaultView(), minDate, maxDate);
    now.setSeconds(0, 0);
    setViewMonth(now);
    setDraft(now);
    setHours(now.getHours());
    setMinutes(now.getMinutes());
  }, [minDate, maxDate, defaultView]);

  // Commit the draft to the field and close.
  const handleCommit = useCallback(() => {
    if (!draft) {
      setOpen(false);
      return;
    }
    const next = showTime
      ? clampToRange(withTime(draft, hours, minutes), minDate, maxDate)
      : draft;
    onChange(next);
    setOpen(false);
  }, [draft, showTime, hours, minutes, minDate, maxDate, onChange]);

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
    (hour24: number) => (draft ? isHourDisabled(draft, hour24, minDate, maxDate) : false),
    [draft, minDate, maxDate],
  );

  const minuteDisabledInDay = useCallback(
    (hour24: number, minute: number) =>
      draft ? isMinuteDisabled(draft, hour24, minute, minDate, maxDate) : false,
    [draft, minDate, maxDate],
  );

  const YearSelect = (
    <MonthYearSelect
      value={viewMonth.getFullYear().toString()}
      options={yearOptions}
      onChange={handleYearChange}
      className="w-auto min-w-[76px]"
    />
  );

  const MonthSelect = (
    <MonthYearSelect
      value={viewMonth.getMonth().toString()}
      options={monthOptions}
      onChange={handleMonthChange}
      className="w-auto min-w-[68px]"
    />
  );

  return (
    <ResponsivePopover
      open={open}
      onOpenChange={handleOpenChange}
      title={defaultPlaceholder}
      trigger={
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
      }
    >
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
          {/* p-0, and no width override: the popover already pads, so the calendar's
              own padding on top of it inset the day grid and left dead space at both
              edges. Its intrinsic (w-fit) width must survive though — forcing w-full
              hands sizing to the narrower month/year row above, and the day cells then
              overflow their tracks and overlap sideways while rows keep full height. */}
          <Calendar
            mode="single"
            selected={draft}
            onSelect={handleSelect}
            month={viewMonth}
            onMonthChange={setViewMonth}
            minDate={calendarMinDate}
            maxDate={maxDate}
            locale={bcp47}
            hideHeader
            className="p-0"
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
          {displayZone && (
            <div className="mt-2 text-xs text-muted-foreground">{displayZoneLabel ?? displayZone}</div>
          )}
          {/* Footer: optional Now, plus explicit Close (discard) / Select (commit) */}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-input pt-2">
            <div>
              {showTime && (
                <button
                  type="button"
                  onClick={handleNow}
                  className="inline-flex h-7 items-center rounded-md px-2 text-xs hover:bg-accent hover:text-accent-foreground"
                >
                  {t("date.now")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-7 items-center rounded-md border border-input px-2.5 text-xs hover:bg-accent hover:text-accent-foreground"
              >
                {t("common.close")}
              </button>
              <button
                type="button"
                onClick={handleCommit}
                disabled={!draft}
                className="inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("common.select")}
              </button>
            </div>
          </div>
        </div>
    </ResponsivePopover>
  );
}
