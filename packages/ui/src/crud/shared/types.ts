import { createContext, useContext } from "react";

/** Field display configuration for label position and size. */
export interface FieldVariant {
  layout?: "top" | "left" | "inline" | "hidden";
  size?: "sm" | "md" | "lg";
}

/** Context for propagating field display configuration to descendant fields. */
export const FieldVariantContext = createContext<FieldVariant>({
  layout: "top",
  size: "sm",
});

/** Retrieves the current field variant from context, merged with optional overrides. */
export function useFieldVariant(override?: Partial<FieldVariant>): FieldVariant {
  const parent = useContext(FieldVariantContext);
  return { ...parent, ...override };
}

/** Shared props for all form field components. */
export interface CommonFieldProps extends Partial<FieldVariant> {
  label?: string;
  labelKey?: string;
  error?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Shared props for all detail (read-only) field components. */
export interface CommonDetailFieldProps extends Partial<FieldVariant> {
  label?: string;
  labelKey?: string;
  className?: string;
}

// ── Sort / Filter / Pagination types ──

/** Represents a sort configuration with field name and direction. */
export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

/** Represents pagination state with page, size, and total count. */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/** Represents filter state with search text and key-value filters. */
export interface FilterState {
  search: string;
  values: Record<string, unknown>;
}

/** Reason for an empty list state (no data, no filter match, no search match). */
export type EmptyReason = "no-data" | "no-filter" | "no-search";

/** Configuration for drag-and-drop row reordering. */
export interface ReorderConfig<T> {
  /** Field name used for ordering (e.g. "displayOrder", "sortOrder"). */
  orderField: keyof T & string;
  /** Field name for row ID (default: "id"). */
  idField?: keyof T & string;
  /** Callback invoked with reordered data after drag ends. */
  onReorder: (items: T[]) => void | Promise<void>;
  /** Per-row drag gate — return false to disable drag for specific rows. */
  canDrag?: (row: T) => boolean;
}
