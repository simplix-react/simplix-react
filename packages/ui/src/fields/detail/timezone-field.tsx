import { useMemo } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { useTimezoneOptions } from "../../utils/use-timezone-options";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailTimezoneField} component. */
export interface DetailTimezoneFieldProps extends CommonDetailFieldProps {
  /** IANA timezone ID (e.g. "Asia/Seoul"). */
  value: string | null | undefined;
  /** Fallback text when value is null/undefined. Defaults to em-dash. */
  fallback?: string;
}

/**
 * Read-only timezone display field with offset and localized name.
 *
 * @example
 * ```tsx
 * <DetailTimezoneField label="Timezone" value="Asia/Seoul" layout="inline" />
 * ```
 */
export function DetailTimezoneField({
  value,
  fallback = "\u2014",
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailTimezoneFieldProps) {
  const { groups } = useTimezoneOptions();

  const option = useMemo(() => {
    if (!value) return undefined;
    for (const [, opts] of groups) {
      const found = opts.find((o) => o.value === value);
      if (found) return found;
    }
    return undefined;
  }, [groups, value]);

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {option ? (
        <span>
          {option.label}
          {option.localizedName && option.localizedName !== option.value && (
            <span className="text-muted-foreground"> ({option.localizedName})</span>
          )}
        </span>
      ) : (
        <span>{value ?? fallback}</span>
      )}
    </DetailFieldWrapper>
  );
}
