import {
  decodeCalendarDate,
  decodeInstant,
  formatDateShort,
  formatDateTime,
  parseRfc3339,
} from "@simplix-react/headless";
import { useLocale } from "@simplix-react/i18n/react";

import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link DateField}. */
export interface DateFieldProps extends CommonDetailFieldProps {
  /** RFC 3339 instant string, bare calendar date string, or a `Date`. */
  value?: string | Date | null;
  /** Display format. `"datetime"` keeps the time an approver needs. */
  format?: "date" | "datetime";
  /** Explicit display zone for instants (site-scoped screens pass the site zone). */
  displayZone?: string;
}

/**
 * Read-only date/instant row following the semantic-kind contract: bare
 * calendar dates decode from their own components; instants decode in the
 * explicit display zone.
 */
export function DateField({ value, format = "date", displayZone, ...rest }: DateFieldProps) {
  const locale = useLocale();

  let display: string | null = null;
  if (value instanceof Date) {
    display = format === "datetime" ? formatDateTime(value, locale, displayZone) : formatDateShort(value, locale, displayZone);
  } else if (typeof value === "string" && value) {
    if (format === "datetime") {
      const decoded = displayZone ? decodeInstant(value, displayZone) : parseRfc3339(value);
      display = decoded ? formatDateTime(decoded, locale, displayZone) : value;
    } else {
      const decoded = decodeCalendarDate(value) ?? parseRfc3339(value);
      display = decoded ? formatDateShort(decoded, locale, displayZone) : value;
    }
  }

  return <DetailField {...rest}>{display}</DetailField>;
}
