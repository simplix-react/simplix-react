import { useMemo } from "react";
import { useDateTime } from "./datetime-context.js";
import type {
  DateInput,
  FormatDateOptions,
  FormatTimeOptions,
  FormatDateTimeOptions,
} from "../datetime.js";

/**
 * Memoized date formatting bound to the active locale/timezone.
 *
 * @example
 * const joined = useFormattedDate(user.createdAt, { preset: "medium" });
 */
export function useFormattedDate(
  date: DateInput | undefined | null,
  options?: FormatDateOptions,
): string {
  const { formatDate } = useDateTime();

  return useMemo(() => {
    if (!date) return "";
    return formatDate(date, options);
  }, [date, formatDate, options]);
}

/**
 * Memoized time formatting bound to the active locale/timezone.
 */
export function useFormattedTime(
  date: DateInput | undefined | null,
  options?: FormatTimeOptions,
): string {
  const { formatTime } = useDateTime();

  return useMemo(() => {
    if (!date) return "";
    return formatTime(date, options);
  }, [date, formatTime, options]);
}

/**
 * Memoized datetime formatting bound to the active locale/timezone.
 */
export function useFormattedDateTime(
  date: DateInput | undefined | null,
  options?: FormatDateTimeOptions,
): string {
  const { formatDateTime } = useDateTime();

  return useMemo(() => {
    if (!date) return "";
    return formatDateTime(date, options);
  }, [date, formatDateTime, options]);
}

/**
 * Memoized relative-time formatting bound to the active locale.
 *
 * @example
 * const timeAgo = useFormattedRelative(comment.createdAt); // "3 minutes ago"
 */
export function useFormattedRelative(
  date: DateInput | undefined | null,
  baseDate?: Date,
): string {
  const { formatRelative } = useDateTime();

  return useMemo(() => {
    if (!date) return "";
    return formatRelative(date, baseDate);
  }, [date, formatRelative, baseDate]);
}
