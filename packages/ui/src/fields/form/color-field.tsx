import type { CommonFieldProps } from "../../crud/shared/types";
import { ColorPicker } from "../../base/inputs";
import type { PresetColor } from "../../base/inputs";
import { useFlatUIComponents } from "../../provider/ui-provider";
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
  /** Preset color palette. Defaults to 16 common colors. */
  presetColors?: PresetColor[];
  /** Show the native color picker for custom colors. @defaultValue true */
  showCustomPicker?: boolean;
  /** Allow clearing the selected color. @defaultValue true */
  clearable?: boolean;
}

/**
 * Color picker field with a popover palette, optional custom picker, and hex text input.
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
  presetColors,
  showCustomPicker,
  clearable,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: ColorFieldProps) {
  const { Input } = useFlatUIComponents();

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
        <ColorPicker
          value={value}
          onChange={onChange}
          presetColors={presetColors}
          showCustomPicker={showCustomPicker}
          clearable={clearable}
          disabled={disabled}
          aria-label={
            variantProps.layout === "hidden" ? label : undefined
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
