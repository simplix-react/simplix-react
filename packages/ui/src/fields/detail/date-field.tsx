import { useMemo } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import type { DateLike } from "../../utils/parse-date";
import { formatDateMedium, formatDateTime, formatRelativeTime } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailDateField} component. */
export interface DetailDateFieldProps extends CommonDetailFieldProps {
  /** Date value as Date object, ISO string, or unix timestamp. */
  value: DateLike | null;
  /** Display format. Defaults to `"date"`. */
  format?: "date" | "datetime" | "relative";
  /** Fallback text when value is null. Defaults to em-dash. */
  fallback?: string;
}

function formatDate(
  date: Date,
  format: "date" | "datetime" | "relative",
  locale?: string,
): string {
  switch (format) {
    case "date":
      return formatDateMedium(date, locale);
    case "datetime":
      return formatDateTime(date, locale);
    case "relative":
      return formatRelativeTime(date, locale);
  }
}

/**
 * Read-only date display field with support for date, datetime, and relative formats.
 *
 * @example
 * ```tsx
 * <DetailDateField label="Created" value={user.createdAt} format="relative" />
 * ```
 */
export function DetailDateField({
  value,
  format = "date",
  fallback = "\u2014",
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailDateFieldProps) {
  const { locale } = useTranslation("simplix/ui");

  const displayValue = useMemo(() => {
    if (value == null) return fallback;
    const date = parseDate(value);
    if (!date) return fallback;
    return formatDate(date, format, locale);
  }, [value, format, fallback, locale]);

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {displayValue}
    </DetailFieldWrapper>
  );
}
