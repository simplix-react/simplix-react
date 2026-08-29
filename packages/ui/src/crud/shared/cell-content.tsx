import type { ComponentType, ReactNode } from "react";

import { type BadgeProps, BooleanBadge } from "../../base";
import { formatDateMedium, formatDateTime, formatRelativeTime } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";
import { formatWallClockTime } from "../../utils/rfc3339-date";
import { CountryCell, PhoneCell } from "../list/cells";
import type { ListColumnProps } from "../list/crud-list";

/**
 * Resolve enum-like objects to their plain value.
 * Boot API returns enums as `{ type, value, label }` objects.
 * This extracts `.value` so rendering/formatting works correctly.
 */
export function resolveValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null && "value" in value && "type" in value) {
    return (value as { value: unknown }).value;
  }
  return value;
}

export function formatCellValue(
  value: unknown,
  format?: "date" | "datetime" | "time" | "relative",
  locale?: string,
  timeZone?: string,
): string {
  if (value == null) return "";
  if (!format) return String(value);

  // Wall-clock columns (format="time") hold an HH:mm[:ss] LocalTime string with no
  // calendar day, so they never go through Date parsing.
  if (format === "time") return formatWallClockTime(String(value), locale) ?? String(value);

  // Date-only columns (format="date") parse the LocalDate string as a local
  // calendar date (parseDate), avoiding new Date("2026-07-06")'s UTC-midnight
  // shift that renders the previous day west of UTC. datetime/relative keep
  // UTC/offset-aware parsing for real timestamps.
  const date =
    format === "date"
      ? (value instanceof Date ? value : parseDate(String(value)))
      : (value instanceof Date ? value : new Date(String(value)));
  if (!date || Number.isNaN(date.getTime())) return String(value);

  if (format === "date") return formatDateMedium(date, locale);
  // timeZone applies to absolute instants only; date/time/relative are zone-neutral.
  if (format === "datetime") return formatDateTime(date, locale, timeZone);
  return formatRelativeTime(date, locale);
}

/**
 * What a cell needs from its table that a column declaration cannot carry: the resolved `Badge`
 * (hooked once per table, never once per cell), the active locale, and the ambient display zone a
 * column that declares none falls back to.
 */
export interface CellRenderContext {
  Badge: ComponentType<BadgeProps>;
  locale?: string;
  defaultDisplayZone?: string;
}

/**
 * The content of one cell, from the column's declaration and the row's raw value.
 *
 * <p>Both tables render their cells through this, so `display` and `format` mean the same thing in
 * a tree as in a list. `children` receives the raw value — an enum arrives as the whole
 * `{ type, value, label }` object — while every other branch reads the resolved one.
 */
export function renderCellContent<T>(
  colDef: ListColumnProps<T>,
  raw: unknown,
  row: T,
  ctx: CellRenderContext,
): ReactNode {
  // Custom render prop (pass raw for full access)
  if (colDef.children) {
    return colDef.children({ value: raw, row });
  }

  const value = resolveValue(raw);

  if (colDef.display === "badge" && colDef.variants) {
    const strVal = String(value ?? "");
    const variant = colDef.variants[strVal] ?? "default";
    const label =
      colDef.enumName && colDef.enumLabel ? colDef.enumLabel(colDef.enumName, strVal) : strVal;
    const { Badge } = ctx;
    return <Badge variant={variant}>{label}</Badge>;
  }

  if (colDef.display === "boolean") {
    return <BooleanBadge value={!!value} />;
  }

  if (colDef.display === "country") {
    return <CountryCell value={String(value ?? "")} />;
  }

  if (colDef.display === "phone") {
    return <PhoneCell value={String(value ?? "")} />;
  }

  const cellZone =
    (typeof colDef.displayZone === "function" ? colDef.displayZone(row) : colDef.displayZone) ??
    ctx.defaultDisplayZone;
  return formatCellValue(value, colDef.format, ctx.locale, cellZone);
}
