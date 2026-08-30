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
  /**
   * Server filter key.
   *
   * <p>A chip row narrows to several values at once, so the key is the membership operator —
   * `"holidayType.in"` rather than `"holidayType.equals"`. The value written under it is an
   * array; a request builder that stringifies it produces the comma-separated list the
   * membership operator reads.
   */
  field: string;
  /** Available options. */
  options: ChipFilterOption<T>[];
  /** CrudList filter state to read/write. */
  state: CrudListFilters;
  /** Space between chips. @defaultValue "xs" */
  gap?: "none" | "xs" | "sm" | "md" | "lg";
}

/**
 * @param value whatever sits under the field today
 * @returns the chosen values, as the row always reads them
 */
function chosenValues<T extends string | number>(value: unknown): readonly T[] {
  if (Array.isArray(value)) return value as T[];
  // A caller may seed one value through `defaultFilters`, and that is a legitimate starting
  // state rather than a shape to reject.
  if (value === undefined || value === null || value === "") return [];
  return [value as T];
}

/**
 * What a chip row has narrowed to, for whoever consumes the narrowing.
 *
 * <p>Exported because a chip row's value is an array and every consumer would otherwise widen it
 * by hand — and a consumer that reads it as a scalar gets `undefined` silently, leaving the row
 * lit and nothing narrowed. Reads the committed side, which is the one a query may use.
 *
 * @typeParam T the option value type
 * @param state the filter state the row writes to
 * @param field the same key the row was given
 * @returns the chosen values, empty when the row narrows nothing
 */
export function chipFilterValues<T extends string | number = string>(
  state: CrudListFilters,
  field: string,
): readonly T[] {
  return chosenValues<T>(state.committedValues[field]);
}

/**
 * Toggle chips that integrate with {@link CrudListFilters} for server-side filtering.
 *
 * <p><b>Several at once.</b> A chip narrows the set rather than choosing from it, so pressing a
 * second chip widens the narrowing instead of replacing it, and pressing a lit chip drops that
 * value. With every chip off the field carries nothing and the set is unnarrowed. A row where
 * only one chip can be lit is a tab strip wearing pills — the reader cannot tell the two apart,
 * and the one that answers to a press differently from how it looks is the one that misleads.
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
 *   field="status.in"
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
  const chosen = chosenValues<T>(state.values[field]);

  const handleToggle = useCallback(
    (value: T) => {
      const next = chosen.includes(value)
        ? chosen.filter((candidate) => candidate !== value)
        : [...chosen, value];
      // `commitValue` rather than `setAll`: it writes the one field instead of replacing the
      // whole set, and it returns the list to its first page — narrowing while standing on page
      // three otherwise leaves the reader on a page the narrowed set may not reach.
      state.commitValue(field, next.length > 0 ? next : undefined);
    },
    [field, chosen, state],
  );

  return (
    <Flex wrap gap={gap} align="center">
      {options.map((opt) => {
        const isActive = chosen.includes(opt.value);
        return (
          <button
            type="button"
            key={String(opt.value)}
            disabled={opt.disabled}
            aria-pressed={isActive}
            onClick={() => handleToggle(opt.value)}
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
