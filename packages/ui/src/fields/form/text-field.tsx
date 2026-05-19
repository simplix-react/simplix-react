import type { ReactNode } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";
import { InlineIconPickerTrigger } from "../shared/inline-icon-picker-trigger";
import { ColorPicker } from "../../base/inputs/color-picker";

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
  /**
   * Control rendered on the leading side of the input (same row).
   * Use for IconPicker, ColorPicker, or similar adornments. Takes precedence over {@link iconValue}.
   */
  prefixControl?: ReactNode;
  /** Control rendered on the trailing side of the input (same row). */
  suffixControl?: ReactNode;
  /** Convenience: current icon name. When provided, an IconPicker is rendered as prefixControl. */
  iconValue?: string;
  /** Convenience: called when the icon changes. */
  onIconChange?: (value: string) => void;
  /** Convenience: current color (hex). When provided, a ColorPicker is rendered as suffixControl. */
  colorValue?: string;
  /** Convenience: called when the color changes. */
  onColorChange?: (value: string) => void;
}

/**
 * Text input field with label, error, and description support.
 *
 * Supports leading/trailing adornments via {@link TextFieldProps.prefixControl} /
 * {@link TextFieldProps.suffixControl}. Convenience props {@link TextFieldProps.iconValue} /
 * {@link TextFieldProps.colorValue} auto-render the standard pickers.
 *
 * @example
 * ```tsx
 * <TextField label="Name" value={v} onChange={setV} iconValue={icon} onIconChange={setIcon} />
 * ```
 */
export function TextField({
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  inputProps,
  prefixControl,
  suffixControl,
  iconValue,
  onIconChange,
  colorValue,
  onColorChange,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: TextFieldProps) {
  const { Input } = useFlatUIComponents();

  const resolvedPrefix = prefixControl ?? (onIconChange ? (
    <InlineIconPickerTrigger value={iconValue} onChange={onIconChange} disabled={disabled} />
  ) : undefined);
  const resolvedSuffix = suffixControl ?? (onColorChange ? (
    <ColorPicker value={colorValue ?? ""} onChange={onColorChange} disabled={disabled} />
  ) : undefined);

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      prefixControl={resolvedPrefix}
      suffixControl={resolvedSuffix}
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
        aria-label={variantProps.layout === "hidden" ? label : undefined}
        {...inputProps}
        className={cn(error && "border-destructive", inputProps?.className)}
      />
    </FieldWrapper>
  );
}
