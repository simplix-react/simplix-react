import type { CommonFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link TextField} form component. */
export interface TextFieldProps extends CommonFieldProps {
  /** Current input value. */
  value: string;
  /** Called when the value changes. */
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** HTML input type. Defaults to `"text"`. */
  type?: "text" | "email" | "url" | "password" | "tel";
  /** Additional props forwarded to the underlying input element. */
  inputProps?: React.ComponentProps<"input">;
}

/**
 * Text input field with label, error, and description support.
 *
 * @example
 * ```tsx
 * <TextField label="Email" value={email} onChange={setEmail} type="email" required />
 * ```
 */
export function TextField({
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  inputProps,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: TextFieldProps) {
  const { Input } = useUIComponents();

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
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
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
