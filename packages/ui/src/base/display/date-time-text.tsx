import { useMemo, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { useDefaultDisplayZone } from "../../crud/shared/display-zone-context";
import type { DateLike } from "../../utils/parse-date";
import { formatDateMedium, formatDateTime } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";
import { formatWallClockTime } from "../../utils/rfc3339-date";

/** Props for {@link InstantText}. */
export interface InstantTextProps {
  /** Absolute instant — RFC 3339 string, `Date`, or epoch. */
  value: DateLike | null | undefined;
  /**
   * IANA display zone the instant is rendered in (site or app zone). Falls back to the
   * ambient {@link DisplayZoneProvider} zone, then the browser zone.
   */
  displayZone?: string;
  /**
   * `"datetime"` (default) shows the date and time; `"date"` shows the instant's calendar
   * date in `displayZone`. Unlike {@link DetailDateField}, `"date"` here honours the zone,
   * so an instant can be shown as its zone-local date without leaking the browser zone.
   */
  format?: "datetime" | "date";
  /** Rendered when the value is null, empty, or unparseable. Defaults to nothing. */
  fallback?: ReactNode;
}

/**
 * Inline text for an absolute instant rendered in an explicit display zone — the
 * raw-text sibling of {@link DetailDateField} for table cells, cards, and captions
 * where a full field row does not fit.
 *
 * @example
 * ```tsx
 * <InstantText value={row.checkedInAt} displayZone={siteZone} />
 * <InstantText value={row.expiresAt} displayZone={siteZone} format="date" fallback="—" />
 * ```
 */
export function InstantText({ value, displayZone, format = "datetime", fallback = null }: InstantTextProps) {
  const { locale } = useTranslation("simplix/ui");
  const defaultZone = useDefaultDisplayZone();
  const zone = displayZone ?? defaultZone;
  const text = useMemo(() => {
    if (value == null || value === "") return null;
    const date = parseDate(value);
    if (!date) return null;
    return format === "date" ? formatDateMedium(date, locale, zone) : formatDateTime(date, locale, zone);
  }, [value, format, locale, zone]);
  return <>{text ?? fallback}</>;
}

/** Props for {@link CalendarDateText}. */
export interface CalendarDateTextProps {
  /** Bare calendar date (`yyyy-MM-dd` `LocalDate`). */
  value: DateLike | null | undefined;
  /** Rendered when the value is null, empty, or unparseable. Defaults to nothing. */
  fallback?: ReactNode;
}

/**
 * Inline text for a zone-neutral calendar date (a `LocalDate`), rendered without a
 * display zone so it never shifts with the viewer's location.
 *
 * @example
 * ```tsx
 * <CalendarDateText value={row.validFrom} />
 * ```
 */
export function CalendarDateText({ value, fallback = null }: CalendarDateTextProps) {
  const { locale } = useTranslation("simplix/ui");
  const text = useMemo(() => {
    if (value == null || value === "") return null;
    const date = parseDate(value);
    if (!date) return null;
    return formatDateMedium(date, locale);
  }, [value, locale]);
  return <>{text ?? fallback}</>;
}

/** Props for {@link WallClockText}. */
export interface WallClockTextProps {
  /** Wall-clock time (`HH:mm[:ss]` `LocalTime`). */
  value: string | null | undefined;
  /** Rendered when the value is null, empty, or unparseable. Defaults to nothing. */
  fallback?: ReactNode;
}

/**
 * Inline text for a wall-clock time (a `LocalTime`), formatted in the active locale.
 *
 * @example
 * ```tsx
 * <WallClockText value={row.startTime} />
 * ```
 */
export function WallClockText({ value, fallback = null }: WallClockTextProps) {
  const { locale } = useTranslation("simplix/ui");
  const text = value ? formatWallClockTime(value, locale) : null;
  return <>{text ?? fallback}</>;
}
