import { useMemo } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { useCountryOptions } from "../../utils/use-country-options";
import { useLibphonenumber } from "../../utils/use-libphonenumber";
import { detailFallback } from "../shared/detail-fallback";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailPhoneField} component. */
export interface DetailPhoneFieldProps extends CommonDetailFieldProps {
  /** E.164 phone number (e.g. "+821012345678"), or an empty string. */
  value: string | null | undefined;
  /** Fallback text when value is null, undefined, or empty string. Defaults to the shared no-value badge. */
  fallback?: string;
}

/**
 * Read-only phone display field: the country flag plus the stored E.164 number
 * formatted in its national convention (international when the country is
 * unknown). Pairs with the {@link PhoneField} form input.
 *
 * @example
 * ```tsx
 * <DetailPhoneField label="Phone" value="+821012345678" layout="inline" />
 * ```
 */
export function DetailPhoneField({
  value,
  fallback,
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailPhoneFieldProps) {
  const options = useCountryOptions();
  const lib = useLibphonenumber();

  const parsed = useMemo(
    () => (value && lib ? lib.parsePhoneNumberFromString(value) : undefined),
    [value, lib],
  );
  const option = useMemo(
    () => (parsed?.country ? options.find((o) => o.code === parsed.country) : undefined),
    [options, parsed],
  );

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {parsed ? (
        <span className="inline-flex items-center gap-1.5">
          {option && <option.Flag className="h-3 w-4.5 shrink-0 rounded-[1px]" />}
          <span className="tabular-nums">
            {option ? parsed.formatNational() : parsed.formatInternational()}
          </span>
        </span>
      ) : value ? (
        <span>{value}</span>
      ) : (
        detailFallback(fallback)
      )}
    </DetailFieldWrapper>
  );
}
