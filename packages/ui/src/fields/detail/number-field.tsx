import { useMemo } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailNumberField} component. */
export interface DetailNumberFieldProps extends CommonDetailFieldProps {
  /** Numeric value to display. */
  value: number | null;
  /** Number formatting style. Defaults to `"decimal"`. */
  format?: "decimal" | "currency" | "percent";
  /** Locale for number formatting (e.g., `"en-US"`). */
  locale?: string;
  /** Currency code when `format="currency"` (e.g., `"USD"`). */
  currency?: string;
  /** Fallback text when value is null. Defaults to em-dash. */
  fallback?: string;
}

/**
 * Read-only number display field with Intl.NumberFormat formatting.
 *
 * @example
 * ```tsx
 * <DetailNumberField label="Price" value={29.99} format="currency" currency="USD" />
 * <DetailNumberField label="Rate" value={0.85} format="percent" />
 * ```
 */
export function DetailNumberField({
  value,
  format = "decimal",
  locale,
  currency,
  fallback = "\u2014",
  label,
  labelKey,
  labelPosition,
  size,
  className,
}: DetailNumberFieldProps) {
  const displayValue = useMemo(() => {
    if (value == null) return fallback;

    const options: Intl.NumberFormatOptions = {};

    switch (format) {
      case "currency":
        options.style = "currency";
        options.currency = currency ?? "USD";
        break;
      case "percent":
        options.style = "percent";
        break;
      case "decimal":
      default:
        options.style = "decimal";
        break;
    }

    return new Intl.NumberFormat(locale, options).format(value);
  }, [value, format, locale, currency, fallback]);

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      labelPosition={labelPosition}
      size={size}
      className={className}
    >
      {displayValue}
    </DetailFieldWrapper>
  );
}
