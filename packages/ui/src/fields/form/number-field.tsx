import { NumberInput } from "../../base/inputs/number-input";
import type { CommonFieldProps } from "../../crud/shared/types";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link NumberField} form component. */
export interface NumberFieldProps extends CommonFieldProps {
  /** Current numeric value, or `null` when empty. */
  value: number | null;
  /** Called when the value changes. Receives `null` when input is cleared. */
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  /** Unit suffix displayed inside the input (e.g. "sec", "px", "kg"). */
  suffix?: string;
  /**
   * How many characters the longest value takes, overriding what the bounds imply.
   *
   * <p>For a field whose range says nothing about how long the value reads — an unbounded count
   * that is nevertheless always four digits, an identifier-shaped number.
   */
  digits?: number;
  /** Additional props forwarded to the underlying input element. */
  inputProps?: Omit<React.ComponentProps<"input">, "type" | "onChange" | "value">;
}

/**
 * The width a bounded field with nothing to bound it takes.
 *
 * <p>Wide enough for eight digits, which covers what an operator types into a form, and far
 * narrower than the sentence-width box a text field draws. A field that knows its bounds says
 * so and gets an exact measure instead.
 */
const UNBOUNDED_DIGITS = 8;

/**
 * @param min the lowest value the field accepts, when it has one
 * @param max the highest value the field accepts, when it has one
 * @param step how far one press of the spinner moves, which is where the decimals are declared
 * @returns how many characters the longest value takes
 */
function measureDigits(min?: number, max?: number, step?: number): number {
  const whole = (value: number) => String(Math.floor(Math.abs(value))).length;
  const bounded = min !== undefined || max !== undefined;
  const integers = bounded
    ? Math.max(min === undefined ? 1 : whole(min), max === undefined ? 1 : whole(max))
    : UNBOUNDED_DIGITS;
  // A negative bound spends a character on the sign, and it is only ever the lower one.
  const sign = min !== undefined && min < 0 ? 1 : 0;
  // The decimal places come from the step: a field stepping by 0.25 accepts two of them, and the
  // point itself takes a character. An integer step declares none.
  const stepText = step === undefined ? "" : String(step);
  const point = stepText.indexOf(".");
  const decimals = point === -1 ? 0 : stepText.length - point;
  return integers + sign + decimals;
}

/**
 * Numeric input field with null handling for empty values and
 * always-visible spinner buttons.
 *
 * <p><b>Its width follows the value, not the row.</b> A box stretched to the width of the text
 * field above it asks for a sentence, and a two-digit field spanning half the panel stops saying
 * what goes in it. The measure is worked out from `min`, `max` and `step` — the same bounds the
 * field already validates against — so a screen states its range once and gets the width with it.
 *
 * @example
 * ```tsx
 * <NumberField label="Age" value={age} onChange={setAge} min={0} max={150} />
 * ```
 */
export function NumberField({
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
  suffix,
  digits,
  inputProps,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: NumberFieldProps) {
  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      {({ id }) => (
        <NumberInput
          id={id}
          value={value === null ? "" : String(value)}
          onChange={onChange}
          // The NumberInput change handler ignores empty input (nothing to
          // parse); catch it here so clearing the field propagates null.
          onChangeCapture={(e) => {
            if ((e.target as HTMLInputElement).value === "") onChange(null);
          }}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          suffix={suffix}
          digits={digits ?? measureDigits(min, max, step)}
          aria-invalid={!!error}
          aria-label={variantProps.layout === "hidden" ? label : undefined}
          {...inputProps}
          className={cn("h-9", error && "border-destructive", inputProps?.className)}
        />
      )}
    </FieldWrapper>
  );
}
