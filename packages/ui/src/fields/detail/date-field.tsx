import { useMemo } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import type { DateLike } from "../../utils/parse-date";
import { parseDate } from "../../utils/parse-date";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailDateField} component. */
export interface DetailDateFieldProps extends CommonDetailFieldProps {
  /** Date value as Date object, ISO string, or unix timestamp. */
  value: DateLike | null;
  /** Display format. Defaults to `"date"`. */
  format?: "date" | "datetime" | "relative" | string;
  /** Fallback text when value is null. Defaults to em-dash. */
  fallback?: string;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffInSeconds = Math.round((date.getTime() - now) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 10) return "just now";

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (absDiff >= seconds) {
      const value = Math.round(diffInSeconds / seconds);
      return rtf.format(value, unit);
    }
  }

  return "just now";
}

function formatDate(
  date: Date,
  format: "date" | "datetime" | "relative" | string,
): string {
  switch (format) {
    case "date":
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
      }).format(date);

    case "datetime":
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);

    case "relative":
      return formatRelativeTime(date);

    default:
      // Custom format string treated as locale
      return new Intl.DateTimeFormat(format).format(date);
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
  const displayValue = useMemo(() => {
    if (value == null) return fallback;
    const date = parseDate(value);
    if (!date) return fallback;
    return formatDate(date, format);
  }, [value, format, fallback]);

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
