import { useMemo } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { useCurrencyOptions } from "../../utils/use-currency-options";
import { detailFallback } from "../shared/detail-fallback";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailCurrencyField} component. */
export interface DetailCurrencyFieldProps extends CommonDetailFieldProps {
  /** ISO 4217 currency code (e.g. "KRW"). */
  value: string | null | undefined;
  /** Fallback text when value is null, undefined, or empty string. Defaults to the shared no-value badge. */
  fallback?: string;
}

/**
 * Read-only currency display field: the ISO 4217 code beside its localized name.
 *
 * <p>The code stays visible rather than being replaced by the name — it is what the record
 * stores and what an operator matches against an invoice.
 *
 * @example
 * ```tsx
 * <DetailCurrencyField label="Currency" value="KRW" layout="inline" />
 * ```
 */
export function DetailCurrencyField({
  value,
  fallback,
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailCurrencyFieldProps) {
  const options = useCurrencyOptions();

  const option = useMemo(
    () => (value ? options.find((o) => o.code === value) : undefined),
    [options, value],
  );

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {option ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-xs">{option.code}</span>
          <span>{option.localName}</span>
        </span>
      ) : value ? (
        <span className="font-mono text-xs">{value}</span>
      ) : (
        detailFallback(fallback)
      )}
    </DetailFieldWrapper>
  );
}
