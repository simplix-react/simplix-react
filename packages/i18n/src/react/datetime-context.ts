import { createContext, useContext } from "react";
import type {
  DateInput,
  FormatDateOptions,
  FormatTimeOptions,
  FormatDateTimeOptions,
} from "../datetime.js";

/**
 * DateTime context value — locale/timezone-bound formatters.
 *
 * Populated by {@link DateTimeProvider} (locale from the active i18n adapter,
 * timezone injected by the host).
 */
export interface DateTimeContextValue {
  /** Current locale (e.g., 'ko', 'en'). */
  locale: string;
  /** Current timezone (e.g., 'Asia/Seoul'); empty falls back to the browser zone. */
  timeZone: string;
  /** Format a date according to locale conventions. */
  formatDate: (date: DateInput, options?: FormatDateOptions) => string;
  /** Format a time according to locale conventions. */
  formatTime: (date: DateInput, options?: FormatTimeOptions) => string;
  /** Format date and time together. */
  formatDateTime: (date: DateInput, options?: FormatDateTimeOptions) => string;
  /** Format relative time (e.g., "3 minutes ago"). */
  formatRelative: (date: DateInput, baseDate?: Date) => string;
}

export const DateTimeContext = createContext<DateTimeContextValue | null>(null);

/**
 * Access the locale/timezone-bound date formatters.
 *
 * @throws Error if used outside of {@link DateTimeProvider}.
 *
 * @example
 * const { formatDateTime, formatRelative } = useDateTime();
 * formatDateTime(row.createdAt, { preset: "medium" });
 */
export function useDateTime(): DateTimeContextValue {
  const context = useContext(DateTimeContext);

  if (!context) {
    throw new Error("useDateTime must be used within a DateTimeProvider");
  }

  return context;
}
