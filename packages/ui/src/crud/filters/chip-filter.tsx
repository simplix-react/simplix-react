import { useCallback, type ReactNode } from "react";

import { Grid } from "../../primitives";
import { cn } from "../../utils/cn";
import type { CrudListFilters } from "../list/use-crud-list";

/** A single chip option. */
export interface ChipFilterOption<T extends string | number = string> {
  /** Value sent to the server filter. */
  value: T;
  /** Display label. */
  label: string;
  /** Optional leading icon (e.g. color dot). */
  icon?: ReactNode;
  /** Whether this option is disabled. */
  disabled?: boolean;
}

/** Props for the {@link ChipFilter} component. */
export interface ChipFilterProps<T extends string | number = string> {
  /** Server filter key (e.g. `"holidayType.equals"`). */
  field: string;
  /** Available options. */
  options: ChipFilterOption<T>[];
  /** CrudList filter state to read/write. */
  state: CrudListFilters;
  /** Grid columns. @defaultValue 4 */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Grid gap. @defaultValue "xs" */
  gap?: "none" | "xs" | "sm" | "md" | "lg";
}

/**
 * Toggle chip grid that integrates with {@link CrudListFilters} for server-side filtering.
 *
 * Single-select toggle: clicking an active chip deselects it (shows all).
 *
 * @example
 * ```tsx
 * <CrudList.ChipFilter
 *   field="status.equals"
 *   columns={3}
 *   state={list.filters}
 *   options={[
 *     { value: "active", label: "Active", icon: <StatusDot color="green" /> },
 *     { value: "inactive", label: "Inactive", icon: <StatusDot color="gray" /> },
 *   ]}
 * />
 * ```
 */
export function ChipFilter<T extends string | number = string>({
  field,
  options,
  state,
  columns = 4,
  gap = "xs",
}: ChipFilterProps<T>) {
  const activeValue = state.values[field] as T | undefined;

  const handleSelect = useCallback(
    (value: T) => {
      const next = activeValue === value ? undefined : value;
      state.setAll({
        search: state.search,
        values: { ...state.values, [field]: next },
      });
    },
    [field, activeValue, state],
  );

  return (
    <Grid columns={columns} gap={gap}>
      {options.map((opt) => {
        const isActive = activeValue === opt.value;
        return (
          <button
            type="button"
            key={String(opt.value)}
            disabled={opt.disabled}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "flex flex-1 min-w-0 items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-sm border border-input transition-colors",
              !opt.disabled && !isActive && "bg-background text-foreground hover:bg-accent",
              !opt.disabled && isActive && "bg-primary text-primary-foreground",
              opt.disabled && "bg-muted text-muted-foreground/40 cursor-not-allowed",
            )}
          >
            {opt.icon}
            <span className={cn(opt.disabled && "line-through opacity-50")}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </Grid>
  );
}
