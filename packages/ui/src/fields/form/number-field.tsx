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
  /** Additional props forwarded to the underlying input element. */
  inputProps?: Omit<React.ComponentProps<"input">, "type" | "onChange" | "value">;
}

/**
 * Numeric input field with null handling for empty values and
 * always-visible spinner buttons.
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
      <NumberInput
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
        aria-invalid={!!error}
        aria-label={variantProps.layout === "hidden" ? label : undefined}
        {...inputProps}
        className={cn("h-9", error && "border-destructive", inputProps?.className)}
      />
    </FieldWrapper>
  );
}
