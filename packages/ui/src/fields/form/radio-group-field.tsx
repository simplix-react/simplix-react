import type { CommonFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link RadioGroupField} form component. */
export interface RadioGroupFieldProps<T extends string = string>
  extends CommonFieldProps {
  /** Currently selected radio value. */
  value: T;
  /** Called when the selection changes. */
  onChange: (value: T) => void;
  /** Available radio options with label, value, and optional description. */
  options: Array<{ label: string; value: T; description?: string }>;
  /** Layout direction for the radio items. Defaults to `"column"`. */
  direction?: "column" | "row";
}

const directionClasses = {
  column: "flex flex-col gap-2",
  row: "flex flex-row gap-4",
} as const;

/**
 * Radio group field with support for option descriptions and horizontal/vertical layout.
 *
 * @example
 * ```tsx
 * <RadioGroupField
 *   label="Plan"
 *   value={plan}
 *   onChange={setPlan}
 *   options={[
 *     { label: "Free", value: "free", description: "Basic features" },
 *     { label: "Pro", value: "pro", description: "All features" },
 *   ]}
 * />
 * ```
 */
export function RadioGroupField<T extends string = string>({
  value,
  onChange,
  options,
  direction = "column",
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: RadioGroupFieldProps<T>) {
  const { RadioGroup } = useUIComponents();

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
      <RadioGroup.Root
        value={value}
        onValueChange={(v) => onChange(v as T)}
        disabled={disabled}
        className={cn(directionClasses[direction])}
        aria-label={variantProps.labelPosition === "hidden" ? label : undefined}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <RadioGroup.Item value={opt.value} />
            <span className="text-sm">
              {opt.label}
              {opt.description && (
                <span className="block text-xs text-muted-foreground">
                  {opt.description}
                </span>
              )}
            </span>
          </label>
        ))}
      </RadioGroup.Root>
    </FieldWrapper>
  );
}
