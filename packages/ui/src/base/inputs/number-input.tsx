import { type ComponentPropsWithRef, forwardRef, useRef } from "react";

import { CaretDownIcon } from "../../crud/shared/icons";
import { cn } from "../../utils/cn";

export interface NumberInputProps extends Omit<ComponentPropsWithRef<"input">, "type" | "onChange"> {
  onChange?: (value: number) => void;
  /** Unit suffix displayed between the number and the spinner (e.g. "sec", "px", "kg"). */
  suffix?: string;
}

/**
 * Numeric input with always-visible spinner buttons.
 *
 * @remarks
 * The native browser spinners (which only appear on hover/focus and differ
 * across browsers) are hidden and replaced with the same spinner buttons the
 * time picker uses. Keyboard stepping (ArrowUp/ArrowDown) still works.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, min, max, step, onChange, disabled, suffix, ...rest }, ref) => {
    const innerRef = useRef<HTMLInputElement | null>(null);

    const clamp = (v: number) => {
      const minVal = typeof min === "number" ? min : -Infinity;
      const maxVal = typeof max === "number" ? max : Infinity;
      return Math.min(maxVal, Math.max(minVal, v));
    };

    const stepBy = (delta: number) => {
      const el = innerRef.current;
      if (!el) return;
      const stepVal = typeof step === "number" ? step : parseFloat(String(step ?? "")) || 1;
      const current = parseFloat(el.value);
      // From an empty input the first step lands on min (native behavior)
      const next = Number.isNaN(current)
        ? clamp(typeof min === "number" ? min : delta * stepVal)
        : clamp(current + delta * stepVal);
      // Keep the uncontrolled display in sync; controlled inputs re-render from the prop
      if (rest.value === undefined) el.value = String(next);
      onChange?.(next);
    };

    return (
      <div
        className={cn(
          "flex h-8 w-full items-stretch overflow-hidden rounded-md border border-input bg-background text-sm",
          "focus-within:border-foreground has-[[aria-invalid=true]]:border-destructive",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <input
          ref={(el) => {
            innerRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (Number.isNaN(v)) return;
            onChange?.(clamp(v));
          }}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-1.5 py-1.5 text-center outline-none",
            "placeholder:text-muted-foreground disabled:cursor-not-allowed",
            // Hide the hover-only native spinners; the buttons replace them
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
          {...rest}
        />
        {suffix && (
          <span className="flex shrink-0 items-center pr-1.5 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
        <div className="flex shrink-0 flex-col border-l border-input">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increase"
            disabled={disabled}
            onClick={() => stepBy(1)}
            className="flex flex-1 items-center justify-center px-0.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none"
          >
            <CaretDownIcon className="h-3 w-3 rotate-180" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrease"
            disabled={disabled}
            onClick={() => stepBy(-1)}
            className="flex flex-1 items-center justify-center border-t border-input px-0.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none"
          >
            <CaretDownIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
