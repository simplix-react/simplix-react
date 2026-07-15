import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { CaretDownIcon } from "../../crud/shared/icons";
import { cn } from "../../utils/cn";
import {
  clampTimeValue,
  isHourOutOfRange,
  isMinuteOutOfRange,
  padTimeUnit,
  to12Hour,
  to24Hour,
  wrapValue,
  type TimeValue,
} from "../../utils/time-select";

export type { TimeValue };

// ── TimeSpinnerInput (internal) ──

function TimeSpinnerInput({
  value,
  min,
  max,
  onCommit,
  ariaLabel,
  disabled,
  onActivate,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
  ariaLabel: string;
  disabled?: boolean;
  /** Called when the field takes focus, so the owner can open its option list. */
  onActivate?: () => void;
}) {
  const [text, setText] = useState(() => padTimeUnit(value));
  const [editing, setEditing] = useState(false);

  // While typing, keep the raw digits ("1" must stay "1", not become "01",
  // or a second digit could never be entered). Overwrite only when the value
  // no longer matches the text — i.e. it was changed from outside (option
  // list click, spinner, external update) — or when not editing.
  useEffect(() => {
    setText((prev) => {
      if (editing && parseInt(prev, 10) === value) return prev;
      return padTimeUnit(value);
    });
  }, [value, editing]);

  const handleTextChange = useCallback(
    (raw: string) => {
      const digits = raw.replace(/\D/g, "").slice(0, 2);
      setText(digits);
      if (digits === "") return;
      const num = parseInt(digits, 10);
      if (num > max) {
        onCommit(max);
      } else if (num >= min) {
        onCommit(num);
      }
    },
    [min, max, onCommit],
  );

  const step = useCallback(
    (delta: number) => {
      onCommit(wrapValue(value + delta, min, max));
    },
    [value, min, max, onCommit],
  );

  return (
    <div className="flex flex-1 items-stretch">
      <input
        type="text"
        inputMode="numeric"
        // Keep the intrinsic width tiny so the flex layout (not the input's
        // default size) decides the popover width; flex-1 stretches it back.
        size={2}
        value={text}
        aria-label={ariaLabel}
        disabled={disabled}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={(e) => {
          setEditing(true);
          e.target.select();
          onActivate?.();
        }}
        onBlur={() => {
          setEditing(false);
          setText(padTimeUnit(value));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            step(-1);
          }
        }}
        className="min-w-8 flex-1 bg-transparent text-center text-sm outline-none disabled:cursor-not-allowed"
      />
      <div className="flex shrink-0 flex-col border-l border-input">
        <button
          type="button"
          tabIndex={-1}
          aria-label={`${ariaLabel} +`}
          disabled={disabled}
          onClick={() => step(1)}
          className="flex flex-1 items-center justify-center px-0.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none"
        >
          <CaretDownIcon className="h-3 w-3 rotate-180" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`${ariaLabel} -`}
          disabled={disabled}
          onClick={() => step(-1)}
          className="flex flex-1 items-center justify-center border-t border-input px-0.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none"
        >
          <CaretDownIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ── MeridiemToggle (internal) ──

function MeridiemToggle({
  pm,
  onChange,
  amLabel,
  pmLabel,
  disabled,
}: {
  pm: boolean;
  onChange: (pm: boolean) => void;
  amLabel: string;
  pmLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-stretch border-r border-input" role="group">
      <button
        type="button"
        aria-pressed={!pm}
        disabled={disabled}
        onClick={() => onChange(false)}
        className={cn(
          "whitespace-nowrap px-2 text-xs disabled:pointer-events-none",
          !pm
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground",
        )}
      >
        {amLabel}
      </button>
      <button
        type="button"
        aria-pressed={pm}
        disabled={disabled}
        onClick={() => onChange(true)}
        className={cn(
          "whitespace-nowrap border-l border-input px-2 text-xs disabled:pointer-events-none",
          pm
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground",
        )}
      >
        {pmLabel}
      </button>
    </div>
  );
}

// ── TimeScrollColumn (internal) ──

interface TimeColumnItem {
  value: number;
  label: string;
  disabled: boolean;
}

function TimeScrollColumn({
  items,
  selected,
  onSelect,
  ariaLabel,
  width,
  className,
  style,
}: {
  items: TimeColumnItem[];
  selected: number;
  onSelect: (value: number) => void;
  ariaLabel: string;
  /** Width of the time input this column belongs to, so the two line up exactly. */
  width?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const centerOnMount = useRef(true);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLButtonElement>("[data-selected='true']");
    el?.scrollIntoView?.({ block: centerOnMount.current ? "center" : "nearest" });
    centerOnMount.current = false;
  }, [selected]);

  return (
    <div
      className={cn("relative", width == null && "w-14", className)}
      style={{ ...style, ...(width == null ? {} : { width }) }}
      aria-label={ariaLabel}
    >
      <div ref={listRef} className="absolute inset-0 flex flex-col gap-0.5 overflow-y-auto p-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={item.disabled}
            data-selected={item.value === selected}
            // Keep focus on the time input: a blur here would close the list before the click lands.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(item.value)}
            className={cn(
              "flex h-7 w-full shrink-0 items-center justify-center rounded-md text-sm whitespace-nowrap",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:pointer-events-none disabled:opacity-50",
              item.value === selected &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TimeSelectControl (internal, shared with DatePicker) ──

/**
 * Props for the {@link TimeSelectControl} building block.
 * Works on a 24-hour (hours, minutes) pair; the owner decides how the
 * committed time is combined with a date (or not).
 */
export interface TimeSelectControlProps {
  /** Current hours in 24-hour form (0-23). */
  hours: number;
  /** Current minutes (0-59). */
  minutes: number;
  /** Called with the new 24-hour time on every change. */
  onCommit: (hours24: number, minutes: number) => void;
  /** Use a 12-hour clock with an AM/PM toggle. @defaultValue true */
  hour12?: boolean;
  /** Interval between minute options in the option list. @defaultValue 1 */
  minuteStep?: number;
  /** Disable all inputs and buttons. */
  disabled?: boolean;
  /** Marks hours whose option-list entry should be disabled. */
  isHourDisabled?: (hour24: number) => boolean;
  /** Marks minutes whose option-list entry should be disabled. */
  isMinuteDisabled?: (hour24: number, minute: number) => boolean;
  /** Where the option lists open relative to the input row. @defaultValue "down" */
  dropDirection?: "up" | "down";
  /** Class name for the outer wrapper. */
  className?: string;
  /** Class name merged into the bordered input row (e.g. to change its height). */
  rowClassName?: string;
}

/**
 * Hour/minute spinner input row with an AM/PM toggle whose fields drop
 * scrollable option lists open on focus. Building block for
 * {@link TimePicker} and the `showTime` mode of the date picker.
 */
export function TimeSelectControl({
  hours,
  minutes,
  onCommit,
  hour12 = true,
  minuteStep = 1,
  disabled = false,
  isHourDisabled,
  isMinuteDisabled,
  dropDirection = "down",
  className,
  rowClassName,
}: TimeSelectControlProps) {
  const { t } = useTranslation("simplix/ui");
  const step = Math.max(1, Math.floor(minuteStep));
  const meridiem = to12Hour(hours);

  // The option lists sit directly over the time inputs, so each list takes the width
  // of the input part it belongs to: the hour list spans the AM/PM toggle and the hour
  // box, the minute list the minute box. Measured rather than fixed, because the AM/PM
  // labels are locale-dependent and any fixed width would leave a gap in some language.
  // Element state (not refs) because the inputs may live inside a portal that is not
  // mounted yet when a mount effect would otherwise try to read them.
  const [hourInputEl, setHourInputEl] = useState<HTMLDivElement | null>(null);
  const [minuteInputEl, setMinuteInputEl] = useState<HTMLDivElement | null>(null);
  const [columnWidths, setColumnWidths] = useState<{ hour?: number; minute?: number }>({});
  // Which time input is being edited — its option list is the one that drops open.
  const [activeTimeField, setActiveTimeField] = useState<"hour" | "minute" | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  // True while a pointer interaction that started inside the wrapper is ongoing.
  // Dragging the option list's scrollbar blurs the time input (relatedTarget null),
  // and closing on that blur would kill the list mid-scroll — so blur-close is
  // suppressed for inside interactions and outside clicks close the list instead.
  const pointerInsideRef = useRef(false);

  useEffect(() => {
    if (!activeTimeField) return;
    const handleDown = (e: Event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setActiveTimeField(null);
      }
    };
    const handleUp = () => {
      pointerInsideRef.current = false;
    };
    // mousedown listeners in addition to pointerdown: Chrome fires only
    // mousedown (no pointer events) for native scrollbar interactions.
    document.addEventListener("pointerdown", handleDown);
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("pointerup", handleUp);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("pointerdown", handleDown);
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [activeTimeField]);

  useEffect(() => {
    if (!hourInputEl || !minuteInputEl) return;
    const measure = () => setColumnWidths({
      hour: hourInputEl.offsetWidth,
      minute: minuteInputEl.offsetWidth,
    });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(hourInputEl);
    observer.observe(minuteInputEl);
    return () => observer.disconnect();
  }, [hourInputEl, minuteInputEl]);

  const hourItems = useMemo<TimeColumnItem[]>(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        // 12-hour mode lists the full day chronologically: AM 12, AM 1 ... PM 11
        const h12 = to12Hour(i);
        const label = hour12
          ? `${h12.pm ? t("date.pm") : t("date.am")} ${padTimeUnit(h12.hour12)}`
          : padTimeUnit(i);
        return { value: i, label, disabled: isHourDisabled?.(i) ?? false };
      }),
    [hour12, t, isHourDisabled],
  );

  const minuteItems = useMemo<TimeColumnItem[]>(() => {
    const items: TimeColumnItem[] = [];
    for (let m = 0; m < 60; m += step) {
      items.push({
        value: m,
        label: padTimeUnit(m),
        disabled: isMinuteDisabled?.(hours, m) ?? false,
      });
    }
    // Keep an off-step current minute visible so the selection mark never disappears
    if (minutes % step !== 0) {
      const idx = items.findIndex((item) => item.value > minutes);
      const current: TimeColumnItem = {
        value: minutes,
        label: padTimeUnit(minutes),
        disabled: isMinuteDisabled?.(hours, minutes) ?? false,
      };
      if (idx === -1) items.push(current);
      else items.splice(idx, 0, current);
    }
    return items;
  }, [step, hours, minutes, isMinuteDisabled]);

  const handleHourCommit = useCallback(
    (displayHour: number) => {
      onCommit(hour12 ? to24Hour(displayHour, meridiem.pm) : displayHour, minutes);
    },
    [onCommit, hour12, meridiem.pm, minutes],
  );

  const handleMinuteCommit = useCallback(
    (m: number) => {
      onCommit(hours, m);
    },
    [onCommit, hours],
  );

  const handleMeridiemChange = useCallback(
    (pm: boolean) => {
      onCommit(to24Hour(meridiem.hour12, pm), minutes);
    },
    [onCommit, meridiem.hour12, minutes],
  );

  const listPositionClass =
    dropDirection === "up" ? "bottom-full mb-1" : "top-full mt-1";

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      onPointerDownCapture={() => {
        pointerInsideRef.current = true;
      }}
      // Chrome fires no pointer events when the native scrollbar is grabbed —
      // only mousedown on the scrollable element — so track that path too.
      onMouseDownCapture={() => {
        pointerInsideRef.current = true;
      }}
      onBlur={(e) => {
        // Ignore blurs caused by pointer interactions inside the wrapper
        // (option click, scrollbar drag) — outside clicks close via the
        // document pointerdown listener, keyboard tab-out closes here.
        if (pointerInsideRef.current) return;
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActiveTimeField(null);
      }}
    >
      <div
        className={cn(
          "flex h-8 items-stretch overflow-hidden rounded-md border border-input bg-background",
          disabled && "opacity-50",
          rowClassName,
        )}
      >
        {/* grow (flex-basis auto), not flex-1: preserving each part's intrinsic
            width and splitting only the leftover keeps the two inputs equal. */}
        <div ref={setHourInputEl} className="flex grow items-stretch">
          {hour12 && (
            <MeridiemToggle
              pm={meridiem.pm}
              onChange={handleMeridiemChange}
              amLabel={t("date.am")}
              pmLabel={t("date.pm")}
              disabled={disabled}
            />
          )}
          <TimeSpinnerInput
            value={hour12 ? meridiem.hour12 : hours}
            min={hour12 ? 1 : 0}
            max={hour12 ? 12 : 23}
            onCommit={handleHourCommit}
            ariaLabel={t("date.hour")}
            disabled={disabled}
            onActivate={() => setActiveTimeField("hour")}
          />
        </div>
        <div ref={setMinuteInputEl} className="flex grow items-stretch">
          <span className="flex shrink-0 items-center border-l border-input px-1 text-sm text-muted-foreground">:</span>
          <TimeSpinnerInput
            value={minutes}
            min={0}
            max={59}
            onCommit={handleMinuteCommit}
            ariaLabel={t("date.minute")}
            disabled={disabled}
            onActivate={() => setActiveTimeField("minute")}
          />
        </div>
      </div>
      {activeTimeField === "hour" && (
        <TimeScrollColumn
          items={hourItems}
          selected={hours}
          onSelect={(h) => onCommit(h, minutes)}
          ariaLabel={t("date.hour")}
          width={columnWidths.hour}
          className={cn(
            "absolute left-0 z-10 h-56 rounded-md border border-input bg-popover shadow-md",
            listPositionClass,
          )}
        />
      )}
      {activeTimeField === "minute" && (
        <TimeScrollColumn
          items={minuteItems}
          selected={minutes}
          onSelect={(m) => onCommit(hours, m)}
          ariaLabel={t("date.minute")}
          width={columnWidths.minute}
          className={cn(
            "absolute z-10 h-56 rounded-md border border-input bg-popover shadow-md",
            listPositionClass,
          )}
          style={{ left: columnWidths.hour }}
        />
      )}
    </div>
  );
}

// ── TimePicker ──

/** Props for the {@link TimePicker} component. */
export interface TimePickerProps {
  /** Currently selected time of day. */
  value: TimeValue | undefined;
  /** Called with the new time on every change. */
  onChange: (value: TimeValue) => void;
  /** Use a 12-hour clock with an AM/PM toggle. Set to `false` for a 24-hour clock. @defaultValue true */
  hour12?: boolean;
  /** Interval between minute options in the option list. Direct input and the spinner still accept any minute. @defaultValue 1 */
  minuteStep?: number;
  /** Earliest selectable time. Out-of-range options are disabled and commits are clamped. */
  minTime?: TimeValue;
  /** Latest selectable time. Out-of-range options are disabled and commits are clamped. */
  maxTime?: TimeValue;
  /** Disable the picker. */
  disabled?: boolean;
  /** Additional class name for the wrapper. */
  className?: string;
}

/**
 * Standalone time-of-day input: hour/minute spinner boxes with an AM/PM
 * toggle, where focusing a box drops a scrollable option list open.
 * Shares its UI with the date picker's `showTime` mode.
 *
 * @example
 * ```tsx
 * <TimePicker value={time} onChange={setTime} minuteStep={5} />
 * ```
 */
export function TimePicker({
  value,
  onChange,
  hour12 = true,
  minuteStep = 1,
  minTime,
  maxTime,
  disabled = false,
  className,
}: TimePickerProps) {
  const handleCommit = useCallback(
    (hours24: number, minutes: number) => {
      onChange(clampTimeValue({ hours: hours24, minutes }, minTime, maxTime));
    },
    [onChange, minTime, maxTime],
  );

  const hourDisabled = useCallback(
    (hour24: number) => isHourOutOfRange(hour24, minTime, maxTime),
    [minTime, maxTime],
  );

  const minuteDisabled = useCallback(
    (hour24: number, minute: number) => isMinuteOutOfRange(hour24, minute, minTime, maxTime),
    [minTime, maxTime],
  );

  return (
    <TimeSelectControl
      hours={value?.hours ?? 0}
      minutes={value?.minutes ?? 0}
      onCommit={handleCommit}
      hour12={hour12}
      minuteStep={minuteStep}
      disabled={disabled}
      isHourDisabled={hourDisabled}
      isMinuteDisabled={minuteDisabled}
      dropDirection="down"
      // A time of day is a short value: cap the control instead of letting it
      // stretch across a full form column, which reads as a text input. The
      // floor keeps the AM/PM labels on one line when the column is narrow.
      className={cn("w-48 shrink-0", className)}
      // Match the height of Input and the other form controls
      rowClassName="h-9"
    />
  );
}
