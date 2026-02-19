import type { CommonFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider/ui-provider";
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
  const { Input } = useUIComponents();

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
        aria-label={variantProps.labelPosition === "hidden" ? label : undefined}
        {...inputProps}
        className={cn(error && "border-destructive", inputProps?.className)}
      />
    </FieldWrapper>
  );
}
