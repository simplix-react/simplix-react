import type { ReactNode } from "react";

import { FieldChevron } from "../../base/inputs/field-chevron";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";

/** Props for the {@link SelectFieldTrigger} component. */
export interface SelectFieldTriggerProps {
  /** Id the field's label points at. Goes on the button — a labelable control. */
  id?: string;
  /** Id of the label element, for `aria-labelledby`. */
  labelId?: string;
  /** Accessible name for a field that renders no visible label. */
  ariaLabel?: string;
  /** Whether the popover is open. */
  open: boolean;
  disabled?: boolean;
  /** Error message; only its presence is read, to tint the border. */
  error?: string;
  /** Extra classes for the positioning wrapper, e.g. `flex-1` inside a row. */
  className?: string;
  /** Clear affordance, rendered over the trigger's trailing edge as its SIBLING. */
  clearAction?: ReactNode;
  /** Secondary affordance (e.g. open a full search dialog), also a sibling. */
  expandAction?: ReactNode;
  /** The selected value or placeholder, rendered inside the trigger. */
  children: ReactNode;
}

/**
 * The bordered box of a popover-backed select field: it IS the popover trigger,
 * a real `<button>`, and the trailing affordances sit over it as siblings.
 *
 * Putting the clear button inside the trigger nests a control in a control —
 * the keyboard and assistive technology then have to guess which of the two a
 * press belongs to, and the guesses disagree. The trigger reserves the width the
 * siblings overlay so a long value never runs under them.
 *
 * @example
 * ```tsx
 * <SelectFieldTrigger id={id} labelId={labelId} open={open} clearAction={clearButton}>
 *   <span className="flex-1 truncate">{selected?.label ?? placeholder}</span>
 * </SelectFieldTrigger>
 * ```
 */
export function SelectFieldTrigger({
  id,
  labelId,
  ariaLabel,
  open,
  disabled,
  error,
  className,
  clearAction,
  expandAction,
  children,
}: SelectFieldTriggerProps) {
  const { PopoverTrigger } = useFlatUIComponents();
  const trailingCount = (clearAction ? 1 : 0) + (expandAction ? 1 : 0);

  return (
    <div className={cn("relative flex w-full min-w-0 items-center", className)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-labelledby={labelId}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "flex h-8 w-full min-w-0 items-center gap-1 rounded-md border border-input bg-background px-3 text-left text-sm",
            "focus-visible:border-foreground focus-visible:outline-none",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-destructive focus-visible:border-destructive",
          )}
        >
          {children}
          {/* Holds open exactly the strip the sibling buttons are positioned over:
              each is 20px wide with a 4px gap, starting 32px from the right edge. */}
          {trailingCount > 0 && (
            <span
              aria-hidden="true"
              className={cn("shrink-0", trailingCount === 1 ? "w-5" : "w-11")}
            />
          )}
          <FieldChevron />
        </button>
      </PopoverTrigger>
      {trailingCount > 0 && (
        <span className="absolute right-8 flex items-center gap-1">
          {clearAction}
          {expandAction}
        </span>
      )}
    </div>
  );
}
