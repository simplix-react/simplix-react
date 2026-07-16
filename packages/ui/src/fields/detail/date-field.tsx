import { useMemo } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import type { DateLike } from "../../utils/parse-date";
import { formatDateMedium, formatDateTime, formatRelativeTime } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";
import { formatWallClockTime } from "../../utils/rfc3339-date";
import { detailFallback } from "../shared/detail-fallback";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailDateField} component. */
export interface DetailDateFieldProps extends CommonDetailFieldProps {
  /**
   * The value to display. For `date`/`datetime`/`relative` it is a `Date`, ISO string, or
   * unix timestamp; for `time` it is a wall-clock `HH:mm[:ss]` string (a `LocalTime`).
   */
  value: DateLike | null;
  /** Display format. Defaults to `"date"`. */
  format?: "date" | "datetime" | "time" | "relative";
  /** Fallback text when value is null. Defaults to the shared no-value badge. */
  fallback?: string;
  /**
   * IANA display timezone for a site-scoped `Instant` value. Applies to
   * `format: "datetime"` (rendered in this zone instead of the browser zone).
   * `format: "date"`/`"time"` are zone-neutral and `format: "relative"` is
   * inherently zone-independent, so all three ignore it.
   */
  displayZone?: string;
}

function formatDate(
  date: Date,
  format: "date" | "datetime" | "relative",
  locale?: string,
  timeZone?: string,
): string {
  switch (format) {
    case "date":
      return formatDateMedium(date, locale);
    case "datetime":
      return formatDateTime(date, locale, timeZone);
    case "relative":
      return formatRelativeTime(date, locale);
  }
}

/**
 * Read-only date/time display field. Supports calendar `date`, absolute `datetime`,
 * wall-clock `time`, and `relative` formats — one component for every temporal kind.
 *
 * @example
 * ```tsx
 * <DetailDateField label="Created" value={user.createdAt} format="relative" />
 * <DetailDateField label="Start" value={overtime.plannedStartTime} format="time" />
 * ```
 */
export function DetailDateField({
  value,
  format = "date",
  fallback,
  displayZone,
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailDateFieldProps) {
  const { locale } = useTranslation("simplix/ui");

  const displayValue = useMemo(() => {
    if (value == null) return null;
    if (format === "time") return formatWallClockTime(typeof value === "string" ? value : null, locale) ?? null;
    const date = parseDate(value);
    if (!date) return null;
    return formatDate(date, format, locale, format === "date" ? undefined : displayZone);
  }, [value, format, locale, displayZone]);

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {displayValue ?? detailFallback(fallback)}
    </DetailFieldWrapper>
  );
}
