import type { CommonFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link ColorField} form component. */
export interface ColorFieldProps extends CommonFieldProps {
  /** Current hex color value (e.g. `"#ff0000"`). */
  value: string;
  /** Called when the value changes. */
  onChange: (value: string) => void;
  /** Additional props forwarded to the underlying text input element. */
  inputProps?: React.ComponentProps<"input">;
}

/**
 * Color picker field with native color input and hex text input.
 *
 * @example
 * ```tsx
 * <ColorField label="Brand Color" value={color} onChange={setColor} />
 * ```
 */
export function ColorField({
  value,
  onChange,
  inputProps,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: ColorFieldProps) {
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
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            variantProps.labelPosition === "hidden" ? label : undefined
          }
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          disabled={disabled}
          aria-invalid={!!error}
          {...inputProps}
          className={cn(
            "font-mono",
            error && "border-destructive",
            inputProps?.className,
          )}
        />
      </span>
    </FieldWrapper>
  );
}
