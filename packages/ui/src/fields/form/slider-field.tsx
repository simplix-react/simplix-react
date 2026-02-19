import type { CommonFieldProps } from "../../crud/shared/types";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link SliderField} form component. */
export interface SliderFieldProps extends CommonFieldProps {
  /** Current slider value. */
  value: number;
  /** Called when the value changes. */
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Whether to display the current value next to the slider. */
  showValue?: boolean;
  /** Additional props forwarded to the underlying input element. */
  inputProps?: React.ComponentProps<"input">;
}

/**
 * Range slider field using native HTML range input.
 *
 * @example
 * ```tsx
 * <SliderField label="Volume" value={volume} onChange={setVolume} min={0} max={100} showValue />
 * ```
 */
export function SliderField({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  inputProps,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: SliderFieldProps) {
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
      <span className="flex items-center gap-3">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={!!error}
          aria-label={
            variantProps.labelPosition === "hidden" ? label : undefined
          }
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          {...inputProps}
          className={cn("w-full", inputProps?.className)}
        />
        {showValue && (
          <span className="min-w-[3ch] text-right text-sm tabular-nums text-muted-foreground">
            {value}
          </span>
        )}
      </span>
    </FieldWrapper>
  );
}
