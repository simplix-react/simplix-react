import { useMemo, type ReactNode } from "react";
import { useLocale } from "./use-translation.js";
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelative,
} from "../datetime.js";
import { DateTimeContext, type DateTimeContextValue } from "./datetime-context.js";

/**
 * Props for {@link DateTimeProvider}.
 */
export interface DateTimeProviderProps {
  /**
   * IANA timezone the time portion is displayed in (e.g. "Asia/Seoul").
   * Falls back to the browser timezone when omitted.
   */
  timeZone?: string;
  children: ReactNode;
}

/**
 * Binds the active i18n locale + an injected timezone to the locale-aware
 * Intl formatters in `../datetime`, exposing them via {@link useDateTime}.
 *
 * The framework is host-agnostic: the consuming app injects its `timeZone`.
 *
 * @example
 * <DateTimeProvider timeZone="Asia/Seoul">{children}</DateTimeProvider>
 */
export function DateTimeProvider({ timeZone, children }: DateTimeProviderProps) {
  const locale = useLocale();
  const tz = timeZone ?? "";

  const value = useMemo<DateTimeContextValue>(
    () => ({
      locale,
      timeZone: tz,
      formatDate: (date, options) => formatDate(date, locale, tz, options),
      formatTime: (date, options) => formatTime(date, locale, tz, options),
      formatDateTime: (date, options) => formatDateTime(date, locale, tz, options),
      formatRelative: (date, baseDate) => formatRelative(date, locale, baseDate),
    }),
    [locale, tz],
  );

  return <DateTimeContext.Provider value={value}>{children}</DateTimeContext.Provider>;
}
