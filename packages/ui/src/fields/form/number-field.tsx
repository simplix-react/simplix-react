import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
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
  inputProps?: React.ComponentProps<"input">;
}

/**
 * Numeric input field with null handling for empty values.
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
  const { Input } = useFlatUIComponents();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      onChange(null);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  }

  const input = (
    <Input
      type="number"
      value={value === null ? "" : String(value)}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      aria-invalid={!!error}
      aria-label={variantProps.layout === "hidden" ? label : undefined}
      {...inputProps}
      className={cn(
        error && "border-destructive",
        suffix && "pr-10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        inputProps?.className,
      )}
    />
  );

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
      {suffix ? (
        <div className="relative">
          {input}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        </div>
      ) : (
        input
      )}
    </FieldWrapper>
  );
}
