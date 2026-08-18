import { useCallback, type ReactNode } from "react";

import { Flex } from "../../primitives";
import { CheckIcon, CircleIcon } from "../shared/icons";
import { cn } from "../../utils/cn";
import type { CrudListFilters } from "../list/use-crud-list";

/** A single chip option. */
export interface ChipFilterOption<T extends string | number = string> {
  /** Value sent to the server filter. */
  value: T;
  /** Display label. */
  label: string;
  /**
   * Replaces the chosen/unchosen mark with something else — a colour dot, a count.
   *
   * <p>Supplying one gives up the mark that says whether this chip is on, so only pass it where
   * the chip's own colour already carries that.
   */
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
  /** Space between chips. @defaultValue "xs" */
  gap?: "none" | "xs" | "sm" | "md" | "lg";
}

/**
 * Toggle chips that integrate with {@link CrudListFilters} for server-side filtering.
 *
 * Single-select toggle: clicking an active chip deselects it (shows all).
 *
 * <p>The chips flow from the left at their label's width and wrap onto another line when the row
 * runs out. They are deliberately NOT stretched to divide the row evenly: an option's width would
 * then be decided by how many options happen to sit beside it, so the same filter reads as a
 * segmented control on one screen and as chips on the next, and a two-option filter draws two
 * half-page buttons. The row still spans the full width — what is left-aligned is the chips
 * inside it.
 *
 * @example
 * ```tsx
 * <CrudList.ChipFilter
 *   field="status.equals"
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
    <Flex wrap gap={gap} align="center">
      {options.map((opt) => {
        const isActive = activeValue === opt.value;
        return (
          <button
            type="button"
            key={String(opt.value)}
            disabled={opt.disabled}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !opt.disabled && !isActive
                && "border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              !opt.disabled && isActive
                && "border-transparent bg-primary text-primary-foreground",
              opt.disabled
                && "border-transparent bg-muted/50 text-muted-foreground/40 cursor-not-allowed",
            )}
          >
            {opt.icon ?? (
              isActive
                ? <CheckIcon className="size-3.5 shrink-0" />
                : <CircleIcon className="size-3.5 shrink-0 opacity-50" />
            )}
            <span className={cn(opt.disabled && "line-through opacity-50")}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </Flex>
  );
}
