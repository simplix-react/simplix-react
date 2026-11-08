import { useTranslation } from "@simplix-react/i18n/react";
import { type ComponentPropsWithRef, type CSSProperties, forwardRef, useRef } from "react";

import { CaretDownIcon } from "../../crud/shared/icons";
import { cn } from "../../utils/cn";
import { slotAttributes } from "../../design/slot-style";
import {
  numberInputFieldStyle,
  numberInputSpinnerStyle,
  numberInputStepStyle,
  numberInputStyle,
  numberInputSuffixStyle,
} from "./number-input.style";

export interface NumberInputProps extends Omit<ComponentPropsWithRef<"input">, "type" | "onChange"> {
  onChange?: (value: number) => void;
  /** Unit suffix displayed between the number and the spinner (e.g. "sec", "px", "kg"). */
  suffix?: string;
  /**
   * How many characters the longest value takes, which is what decides the width of the typing
   * field; the unit suffix and the spinner column are drawn beside it and add their own width.
   *
   * <p>Left out, the control fills the width it is given, right for a cell it has to fill, wrong
   * for a form, where a box the width of a sentence asks for a sentence. {@link NumberField}
   * works this out from the bounds it was given and passes it, so a form field carries the
   * measure without every screen stating one.
   */
  digits?: number;
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
  ({ className, min, max, step, onChange, disabled, suffix, digits, ...rest }, ref) => {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const { t } = useTranslation("simplix/ui");

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

    // Width: the field is sized to its digits and nothing else. `ch` is read in the field's own font
    // and `content-box` leaves the design's padding outside that count, so neither the spinner
    // column, the suffix (drawn in a smaller font, and as wide as its script makes it) nor a
    // design's padding can take room from the number. The box around it is as wide as its parts need.
    //
    // Height: the box owns it (`h-8`) and the field takes it by stretching, so the field's height
    // is `auto`. A design may give every input in a form its own height (`[&_input]:h-9`), and with
    // `content-box` that height plus the field's vertical padding overflows the box and clips the
    // digits against its lower border; `auto` lets the flex row stretch the field's border box to
    // the box, whatever the padding. A caller's own `style` still wins over both.
    const fieldStyle: CSSProperties = {
      height: "auto",
      ...(digits === undefined ? null : { width: `${digits}ch`, boxSizing: "content-box" }),
      ...rest.style,
    };

    return (
      <div
        className={cn(
          "flex h-8 items-stretch overflow-hidden",
          digits === undefined ? "w-full" : "w-fit max-w-full",
          disabled && "cursor-not-allowed",
          className,
        )}
        {...slotAttributes(numberInputStyle, { disabled: Boolean(disabled) })}
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
            "min-w-0",
            digits === undefined ? "flex-1" : "shrink",
            "disabled:cursor-not-allowed",
            // Hide the hover-only native spinners; the buttons replace them
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
          {...rest}
          style={fieldStyle}
          {...slotAttributes(numberInputFieldStyle, {})}
        />
        {suffix && (
          <span
            className="flex shrink-0 items-center"
            {...slotAttributes(numberInputSuffixStyle, {})}
          >
            {suffix}
          </span>
        )}
        <div
          className="flex shrink-0 flex-col"
          {...slotAttributes(numberInputSpinnerStyle, {})}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label={t("common.increase")}
            disabled={disabled}
            onClick={() => stepBy(1)}
            className="flex flex-1 items-center justify-center disabled:pointer-events-none"
            {...slotAttributes(numberInputStepStyle, { direction: "increase" })}
          >
            <CaretDownIcon className="h-3 w-3 rotate-180" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label={t("common.decrease")}
            disabled={disabled}
            onClick={() => stepBy(-1)}
            className="flex flex-1 items-center justify-center disabled:pointer-events-none"
            {...slotAttributes(numberInputStepStyle, { direction: "decrease" })}
          >
            <CaretDownIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
