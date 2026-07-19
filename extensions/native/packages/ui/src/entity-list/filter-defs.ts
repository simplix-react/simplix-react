import type { SelectOption } from "../inputs/select-sheet";

/**
 * Filter definitions rendered by the `EntityList` filter sheet. Keys are
 * searchable filter keys (`field.operator` — build with `makeFilterKey`),
 * matching the committed value bag of `useEntityFeed`.
 */

/** Single- or multi-choice filter over a fixed option set. */
export interface FacetedFilterDef {
  type: "faceted";
  /** Committed filter key (e.g. `"status.in"`). */
  key: string;
  label: string;
  options: SelectOption[];
  /** Commit an array of values instead of a single value. */
  multiple?: boolean;
}

/** Boolean on/off filter (committed as `true` when on, absent when off). */
export interface ToggleFilterDef {
  type: "toggle";
  /** Committed filter key (e.g. `"active.isTrue"`). */
  key: string;
  label: string;
}

/** Free-text filter. */
export interface TextFilterDef {
  type: "text";
  /** Committed filter key (e.g. `"name.contains"`). */
  key: string;
  label: string;
  placeholder?: string;
}

/** Inclusive date-range filter committed as two boundary keys. */
export interface DateRangeFilterDef {
  type: "date-range";
  /** Committed key of the lower boundary (e.g. `"visitDate.greaterThanOrEqualTo"`). */
  fromKey: string;
  /** Committed key of the upper boundary (e.g. `"visitDate.lessThanOrEqualTo"`). */
  toKey: string;
  label: string;
}

/** A filter definition for the `EntityList` filter sheet. */
export type EntityFilterDef =
  | FacetedFilterDef
  | ToggleFilterDef
  | TextFilterDef
  | DateRangeFilterDef;
