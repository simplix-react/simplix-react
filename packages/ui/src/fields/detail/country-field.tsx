import { useMemo } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { useCountryOptions } from "../../utils/use-country-options";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailCountryField} component. */
export interface DetailCountryFieldProps extends CommonDetailFieldProps {
  /** ISO 3166-1 alpha-2 country code (e.g. "KR"). */
  value: string | null | undefined;
  /** Fallback text when value is null, undefined, or empty string. Defaults to em-dash. */
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
  fallback = "\u2014",
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
        <span className="inline-flex items-center gap-1.5">
          <option.Flag className="h-3 w-4.5 shrink-0 rounded-[1px]" />
          <span>{option.localName}</span>
        </span>
      ) : (
        <span>{value || fallback}</span>
      )}
    </DetailFieldWrapper>
  );
}
