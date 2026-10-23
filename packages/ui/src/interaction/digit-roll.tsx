import { type ComponentPropsWithRef, forwardRef } from "react";

import { slotAttributes } from "../design/slot-style";
import { digitRollColumnStyle, digitRollStyle } from "./digit-roll.style";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export interface DigitRollProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /** The figure to show. A change rolls each digit from its old place to its new one. */
  value: number;
  /** How the number is written; defaults to the reader's locale grouping. */
  format?: (value: number) => string;
}

/**
 * A figure whose digits roll to a new value instead of jumping to it.
 *
 * <p>Every digit is a column of 0 to 9 clipped to one line and moved by a transform, so the change
 * is visible without anything reflowing. Separators and signs are drawn as they are. Screen
 * readers get the whole figure once, from `aria-label`; the columns are hidden from them. With
 * reduced motion the duration token is 0 and the figure simply changes.
 */
export const DigitRoll = forwardRef<HTMLSpanElement, DigitRollProps>(
  ({ value, format = (v) => v.toLocaleString(), className, ...rest }, ref) => {
    const text = format(value);
    return (
      <span ref={ref} className={className} aria-label={text} role="img" {...rest} {...slotAttributes(digitRollStyle, {})}>
        {[...text].map((char, i) => {
          const digit = DIGITS.indexOf(char);
          if (digit < 0) {
            return (
              <span key={`s${i}`} aria-hidden="true">
                {char}
              </span>
            );
          }
          return (
            // raw layout: a one-line clip window for the digit column
            <span key={`d${text.length - i}`} aria-hidden="true" className="inline-block h-[1lh] overflow-hidden align-bottom">
              <span
                className="flex flex-col"
                style={{ transform: `translateY(${-digit}lh)` }}
                {...slotAttributes(digitRollColumnStyle, {})}
              >
                {DIGITS.map((d) => (
                  <span key={d} className="h-[1lh]">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    );
  },
);

DigitRoll.displayName = "DigitRoll";
