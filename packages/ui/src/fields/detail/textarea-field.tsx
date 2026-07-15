import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { cn } from "../../utils/cn";
import { detailFallback } from "../shared/detail-fallback";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailTextareaField} component. */
export interface DetailTextareaFieldProps extends CommonDetailFieldProps {
  /** Multi-line text value to display. Line breaks are preserved. */
  value: string | null | undefined;
  /** Fallback text when value is null, undefined, or empty string. Defaults to the shared no-value badge. */
  fallback?: string;
}

/**
 * Read-only multi-line text display field. Preserves line breaks via
 * `whitespace-pre-wrap`. Counterpart to {@link DetailI18nTextareaField} for
 * non-i18n plain string values.
 *
 * @example
 * ```tsx
 * <DetailTextareaField label="Description" value={data.description} />
 * ```
 */
export function DetailTextareaField({
  value,
  fallback,
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailTextareaFieldProps) {
  const hasValue = value != null && value !== "";

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {hasValue ? (
        <span className={cn("whitespace-pre-wrap")}>{value}</span>
      ) : (
        detailFallback(fallback)
      )}
    </DetailFieldWrapper>
  );
}
