import { SearchOperator } from "@simplix-react/headless";

import type { CrudSearchFilters } from "../patterns/crud-search";
import type { FilterDef } from "../filters/filter-bar";

/**
 * The part of a filter control the address needs: its field and what kind of control it is.
 *
 * <p>A link holds strings only, and a control commits the value of its own type (a toggle commits
 * a boolean, a number filter a number). The kind says which one to read a string back as, so the
 * badge, the popover and the request all see the value the control would have written itself.
 */
export type FilterControl = Pick<FilterDef, "field" | "type">;

/** Where a list keeps its committed filters when the address owns them. */
export interface AddressedFilters {
  /** The filters the address carries now, or `undefined` when it names none. */
  readonly value: CrudSearchFilters | undefined;
  /**
   * Receives the committed filters, in the address's form, each time the reader changes them.
   * `undefined` means no filter is applied. The page writes them into its address with `replace`.
   */
  readonly onChange: (next: CrudSearchFilters | undefined) => void;
  /**
   * The controls the list draws. A key whose field has a toggle or number control is read back as
   * a boolean or a number; without it, only the membership operators (`in`, `notIn`) are
   * recognised and every other value stays a string.
   */
  readonly controls?: readonly FilterControl[];
  /**
   * The request parameters the page forces on the list, such as a tab's. A filter over a field one
   * of them pins is not applied: the forced value wins in the request and the control is hidden, so
   * the filter would narrow with nothing on the screen to show it.
   */
  readonly forced?: Readonly<Record<string, unknown>>;
}

/** What {@link decodeAddressedFilters} reads a link's filters against. */
export interface DecodeAddressedFiltersOptions {
  /** The controls the list draws, by field. */
  readonly controls?: readonly FilterControl[];
  /** The parameters the page forces on the list. */
  readonly forced?: Readonly<Record<string, unknown>>;
}

/** The operators whose value is a set. */
const MEMBERSHIP_OPERATORS = new Set<string>([SearchOperator.IN, SearchOperator.NOT_IN]);

/** The operator that pins one value, the way a tab pins a status. */
const PIN_OPERATOR = SearchOperator.EQUALS;

/** Whether a filter key carries a set. */
function isMembership(key: string): boolean {
  return MEMBERSHIP_OPERATORS.has(key.slice(key.lastIndexOf(".") + 1));
}

/** The field and operator of a filter key; the operator is what follows the last dot. */
function splitKey(key: string): { field: string; operator: string } | null {
  const dot = key.lastIndexOf(".");
  if (dot <= 0 || dot === key.length - 1) return null;
  return { field: key.slice(0, dot), operator: key.slice(dot + 1) };
}

/** The fields the forced parameters decide, and the exact keys they set. */
function pinnedBy(forced: Readonly<Record<string, unknown>> | undefined): { keys: Set<string>; fields: Set<string> } {
  const keys = new Set<string>();
  const fields = new Set<string>();
  for (const key of Object.keys(forced ?? {})) {
    keys.add(key);
    const split = splitKey(key);
    if (split?.operator === PIN_OPERATOR) fields.add(split.field);
  }
  return { keys, fields };
}

/** The strings a filter value holds, as a list. */
function members(raw: string | readonly string[]): string[] {
  return typeof raw === "string" ? [raw] : [...raw];
}

/** A string read as the value of a toggle, or `undefined` when it is neither word. */
function toBoolean(text: string): boolean | undefined {
  if (text === "true") return true;
  if (text === "false") return false;
  return undefined;
}

/** A string read as the value of a number filter, or `undefined` when it is not a number. */
function toNumber(text: string): number | undefined {
  if (text.trim() === "") return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Reads the filters a link carries as the committed values a list holds.
 *
 * <p>The membership operators (`in`, `notIn`) always read as an array, a lone string included,
 * because the facet, country and timezone filters and the chip rows commit arrays and only draw a
 * badge for one. A toggle's `true` and `false` read as booleans and a number filter's value as a
 * number. Anything a control could not have committed is dropped rather than sent: a toggle holding
 * another word, a number holding text.
 *
 * <p>A filter over a field the forced parameters pin with `equals` is dropped, and so is a key the
 * forced parameters set themselves. The request would carry the forced value over it, and the
 * control is hidden, so applying it would narrow the list with nothing on the screen to say so.
 *
 * <p>The result is a new object every call. It never contains an empty string or an empty array.
 *
 * @param filters - What the address carries, usually `search.filters`.
 * @param options - The controls the list draws and the parameters the page forces.
 * @returns The committed filter values, keyed by filter key.
 */
export function decodeAddressedFilters(
  filters: Readonly<Record<string, string | readonly string[]>> | undefined,
  options: DecodeAddressedFiltersOptions = {},
): Record<string, unknown> {
  const kinds = new Map((options.controls ?? []).map((control) => [control.field, control.type]));
  const pinned = pinnedBy(options.forced);
  const decoded: [string, unknown][] = [];
  for (const [key, raw] of Object.entries(filters ?? {})) {
    const split = splitKey(key);
    if (split === null || pinned.keys.has(key) || pinned.fields.has(split.field)) continue;
    const texts = members(raw).filter((text) => text !== "");
    if (texts.length === 0) continue;
    if (MEMBERSHIP_OPERATORS.has(split.operator)) {
      decoded.push([key, texts]);
      continue;
    }
    const kind = kinds.get(split.field);
    const text = texts.length === 1 ? texts[0] : undefined;
    if (kind === "toggle" && split.operator === SearchOperator.EQUALS) {
      const value = text === undefined ? undefined : toBoolean(text);
      if (value !== undefined) decoded.push([key, value]);
    } else if (kind === "number") {
      const value = text === undefined ? undefined : toNumber(text);
      if (value !== undefined) decoded.push([key, value]);
    } else {
      decoded.push([key, texts.length === 1 ? texts[0] : texts]);
    }
  }
  return Object.fromEntries(decoded);
}

/** A committed scalar as the text a link carries, or `undefined` when a link cannot carry it. */
function textOf(value: unknown): string | undefined {
  if (typeof value === "string") return value === "" ? undefined : value;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : undefined;
  if (typeof value === "boolean") return String(value);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  return undefined;
}

/**
 * Writes the committed values a list holds as the filters a link carries.
 *
 * <p>Strings stay as they are, numbers and booleans become their text, a date its ISO instant, and
 * an array its members. Empty values, empty arrays, objects and anything else a link cannot carry
 * are left out, so what is written is what a request would send.
 *
 * @param values - The list's committed filter values.
 * @returns The filters to write into the address, or `undefined` when none applies.
 */
export function encodeAddressedFilters(values: Readonly<Record<string, unknown>>): CrudSearchFilters | undefined {
  const encoded: [string, string | string[]][] = [];
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      const texts = value.map(textOf).filter((text): text is string => text !== undefined);
      // A lone member under an operator that is not a set is the value itself: the address cannot
      // tell a one-element array from a string there, and the request sends the same text for both.
      const lone = texts.length === 1 && !isMembership(key);
      if (texts.length > 0) encoded.push([key, lone ? (texts[0] ?? "") : texts]);
      continue;
    }
    const text = textOf(value);
    if (text !== undefined) encoded.push([key, text]);
  }
  return encoded.length === 0 ? undefined : Object.fromEntries(encoded);
}

/**
 * A string that is equal for two filter sets exactly when they ask the same thing: keys are sorted,
 * members keep their order. Used to tell the list's own change coming back from the address from a
 * change somebody else made to it.
 *
 * @param filters - Filters in the address's form.
 * @returns The comparison string, empty when there are no filters.
 */
export function addressedFiltersKey(filters: CrudSearchFilters | undefined): string {
  if (filters === undefined) return "";
  return JSON.stringify(Object.keys(filters).sort().map((key) => [key, filters[key]]));
}
