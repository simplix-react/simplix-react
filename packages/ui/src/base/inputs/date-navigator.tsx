import { useCallback } from "react";

import { cn } from "../../utils/cn";
import { DatePicker } from "./date-picker";
import type { DatePickerProps } from "./date-picker";

/** Props for the {@link DateNavigator} component. */
export interface DateNavigatorProps extends Omit<DatePickerProps, "clearable"> {
  /** Size variant. @defaultValue "default" */
  size?: "sm" | "default";
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Date picker with previous/next day navigation buttons in a unified button-group style.
 *
 * @example
 * ```tsx
 * <DateNavigator value={date} onChange={setDate} maxDate={new Date()} />
 * ```
 */
export function DateNavigator({
  value,
  onChange,
  minDate,
  maxDate,
  size = "default",
  className,
  ...rest
}: DateNavigatorProps) {
  const current = value ?? new Date();

  const prevDisabled = rest.disabled || (minDate != null && isSameDay(current, minDate));
  const nextDisabled = rest.disabled || (maxDate != null && isSameDay(current, maxDate));

  const goPrev = useCallback(() => {
    if (prevDisabled) return;
    onChange(addDays(current, -1));
  }, [current, prevDisabled, onChange]);

  const goNext = useCallback(() => {
    if (nextDisabled) return;
    onChange(addDays(current, 1));
  }, [current, nextDisabled, onChange]);

  const sm = size === "sm";
  const h = sm ? "h-7" : "h-9";

  return (
    <div className={cn("inline-flex items-center", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center border border-input bg-background transition-colors",
          "rounded-l-md rounded-r-none",
          "hover:bg-accent hover:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          h, sm ? "w-7" : "w-9",
        )}
        disabled={prevDisabled}
        onClick={goPrev}
        aria-label="Previous day"
      >
        <ChevronLeftIcon className={sm ? "size-3.5" : "size-4"} />
      </button>
      <DatePicker
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        clearable={false}
        className={cn(
          h, "w-auto -ml-px rounded-none border-input",
          sm ? "text-xs px-2" : "text-sm",
        )}
        {...rest}
      />
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center border border-input bg-background transition-colors",
          "rounded-r-md rounded-l-none -ml-px",
          "hover:bg-accent hover:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          h, sm ? "w-7" : "w-9",
        )}
        disabled={nextDisabled}
        onClick={goNext}
        aria-label="Next day"
      >
        <ChevronRightIcon className={sm ? "size-3.5" : "size-4"} />
      </button>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.56501 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
