import type { CommonFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link TextareaField} form component. */
export interface TextareaFieldProps extends CommonFieldProps {
  /** Current textarea value. */
  value: string;
  /** Called when the value changes. */
  onChange: (value: string) => void;
  placeholder?: string;
  /** Number of visible text rows. */
  rows?: number;
  maxLength?: number;
  /** Resize behavior. Defaults to `"vertical"`. */
  resize?: "none" | "vertical" | "both";
  /** Additional props forwarded to the underlying textarea element. */
  textareaProps?: React.ComponentProps<"textarea">;
}

const resizeClasses = {
  none: "resize-none",
  vertical: "resize-y",
  both: "resize",
} as const;

/**
 * Multi-line text input field with label, error, and description support.
 *
 * @example
 * ```tsx
 * <TextareaField label="Bio" value={bio} onChange={setBio} rows={4} maxLength={500} />
 * ```
 */
export function TextareaField({
  value,
  onChange,
  placeholder,
  rows,
  maxLength,
  resize = "vertical",
  textareaProps,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: TextareaFieldProps) {
  const { Textarea } = useUIComponents();

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
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-label={variantProps.labelPosition === "hidden" ? label : undefined}
        {...textareaProps}
        className={cn(
          resizeClasses[resize],
          error && "border-destructive",
          textareaProps?.className,
        )}
      />
    </FieldWrapper>
  );
}
