import { useMemo } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { useCountryOptions } from "../../utils/use-country-options";
import { slotAttributes } from "../../design/slot-style";
import { detailFallback } from "../shared/detail-fallback";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";
import { detailCountryFieldValueStyle } from "./country-field.style";
import { fieldFlagStyle } from "../shared/field-parts.style";

/** Props for the {@link DetailCountryField} component. */
export interface DetailCountryFieldProps extends CommonDetailFieldProps {
  /** ISO 3166-1 alpha-2 country code (e.g. "KR"). */
  value: string | null | undefined;
  /** Fallback text when value is null, undefined, or empty string. Defaults to the shared no-value badge. */
  fallback?: string;
}

/**
 * Read-only country display field with flag icon and localized name.
 *
 * @example
 * ```tsx
 * <DetailCountryField label="Country" value="KR" layout="inline" />
 * ```
 */
export function DetailCountryField({
  value,
  fallback,
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailCountryFieldProps) {
  const options = useCountryOptions();

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
        <span className="inline-flex items-center" {...slotAttributes(detailCountryFieldValueStyle, {})}>
          <option.Flag className="h-3 w-4.5 shrink-0" {...slotAttributes(fieldFlagStyle, {})} />
          <span>{option.localName}</span>
        </span>
      ) : value ? (
        <span>{value}</span>
      ) : (
        detailFallback(fallback)
      )}
    </DetailFieldWrapper>
  );
}
