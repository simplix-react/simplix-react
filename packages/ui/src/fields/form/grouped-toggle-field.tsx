import { Check } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useMemo, type ReactNode } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { Flex } from "../../primitives/flex";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** A single toggleable chip option within a {@link GroupedToggleGroup}. */
export interface GroupedToggleOption<T extends string = string> {
  /** Stable value stored in the selection. Must be unique within its group. */
  value: T;
  /** Display text, already resolved to the active locale by the consumer. */
  label: string;
  /** Optional i18n key passthrough (not resolved here — for tooling/consumer use). */
  labelKey?: string;
  /** Optional leading icon (lucide kebab-case name, e.g. `"file"`). */
  icon?: IconName;
  /** Disables this chip and excludes it from the group's select-all. */
  disabled?: boolean;
}

/** A group of toggle chips with an icon title and optional select-all switch. */
export interface GroupedToggleGroup<T extends string = string> {
  /** Key used in the {@link GroupedToggleFieldProps.value} record. */
  id: string;
  /** Group title, already resolved to the active locale by the consumer. */
  label: string;
  /** Optional i18n key passthrough. */
  labelKey?: string;
  /** Optional group icon (lucide kebab-case name). */
  icon?: IconName;
  /** Chips belonging to this group. */
  options: GroupedToggleOption<T>[];
}

/** Information passed to {@link GroupedToggleFieldProps.renderOtherNote}. */
export interface GroupedToggleOtherInfo<T extends string = string> {
  /** Total count of selected values not present in any group's catalog. */
  count: number;
  /** Out-of-catalog selected values keyed by group id. */
  byGroup: Record<string, T[]>;
  /** Flattened list of all out-of-catalog selected values. */
  all: T[];
}

/** Props for the {@link GroupedToggleField} form component. */
export interface GroupedToggleFieldProps<T extends string = string>
  extends CommonFieldProps {
  /** Selected values keyed by group id. */
  value: Record<string, T[]>;
  /** Called when the selection changes. Receives the full next record. */
  onChange: (value: Record<string, T[]>) => void;
  /** Group definitions rendered as cards. */
  groups: GroupedToggleGroup<T>[];
  /** Show the per-group "select all" switch. @defaultValue true */
  showSelectAll?: boolean;
  /** Label for the select-all switch, resolved by the consumer (already localized). */
  selectAllLabel: string;
  /**
   * Renders a note about selected values that match no option in any group's
   * catalog. These values are always preserved across toggles and select-all,
   * so this surfaces externally-registered entries.
   */
  renderOtherNote?: (info: GroupedToggleOtherInfo<T>) => ReactNode;
  /** Number of group columns at the `sm` breakpoint and up. @defaultValue 3 */
  columns?: number;
}

const SM_GRID_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

/**
 * Local pressed-state chip. Not exported — the standalone `ToggleBadge` atom
 * lives elsewhere; extract this if shared reuse is needed.
 */
function ToggleChip<T extends string>({
  option,
  pressed,
  onToggle,
}: {
  option: GroupedToggleOption<T>;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={option.disabled}
      onClick={onToggle}
      className={cn(
        "group inline-flex select-none items-center gap-1 rounded-sm border px-2 py-0.5 text-xs transition-all",
        "border-transparent bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-muted-foreground",
        pressed &&
          "border-primary bg-primary/20 font-semibold text-primary hover:bg-primary/25 hover:text-primary",
      )}
    >
      <Check
        strokeWidth={3}
        aria-hidden="true"
        className={cn("size-3 opacity-50", pressed && "opacity-100")}
      />
      {option.icon && <DynamicIcon name={option.icon} className="size-3" />}
      {option.label}
    </button>
  );
}

/**
 * Grouped inline multi-select. Each group renders an icon title, an optional
 * select-all switch, and a row of toggle chips. Selection is namespaced per
 * group (`Record<groupId, T[]>`), so option values may repeat across groups.
 *
 * @example
 * ```tsx
 * <GroupedToggleField
 *   label="Allowed file types"
 *   value={{ image: ["image/jpeg"], doc: [] }}
 *   onChange={setValue}
 *   groups={[
 *     {
 *       id: "image",
 *       label: "Image",
 *       icon: "image",
 *       options: [
 *         { value: "image/jpeg", label: "JPG" },
 *         { value: "image/png", label: "PNG" },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export function GroupedToggleField<T extends string = string>({
  value,
  onChange,
  groups,
  showSelectAll = true,
  selectAllLabel,
  renderOtherNote,
  columns = 3,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: GroupedToggleFieldProps<T>) {
  const { Switch } = useFlatUIComponents();

  const otherInfo = useMemo<GroupedToggleOtherInfo<T>>(() => {
    const byGroup: Record<string, T[]> = {};
    const all: T[] = [];
    for (const group of groups) {
      const catalog = new Set(group.options.map((o) => o.value));
      const extras = (value[group.id] ?? []).filter((v) => !catalog.has(v));
      if (extras.length > 0) {
        byGroup[group.id] = extras;
        all.push(...extras);
      }
    }
    return { count: all.length, byGroup, all };
  }, [groups, value]);

  function setGroup(groupId: string, next: T[]) {
    onChange({ ...value, [groupId]: next });
  }

  function toggleOption(group: GroupedToggleGroup<T>, optValue: T) {
    const current = value[group.id] ?? [];
    setGroup(
      group.id,
      current.includes(optValue)
        ? current.filter((v) => v !== optValue)
        : [...current, optValue],
    );
  }

  function selectAll(group: GroupedToggleGroup<T>, checked: boolean) {
    const enabled = group.options
      .filter((o) => !o.disabled)
      .map((o) => o.value);
    const current = value[group.id] ?? [];
    setGroup(
      group.id,
      checked
        ? uniqueValues([...current, ...enabled]) // keep disabled/out-of-catalog
        : current.filter((v) => !enabled.includes(v)),
    );
  }

  const gridCols = SM_GRID_COLS[columns] ?? SM_GRID_COLS[3];

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      <div className={cn("grid grid-cols-1 gap-3", gridCols)}>
        {groups.map((group) => {
          const current = value[group.id] ?? [];
          const enabled = group.options
            .filter((o) => !o.disabled)
            .map((o) => o.value);
          const allSelected =
            enabled.length > 0 && enabled.every((v) => current.includes(v));

          return (
            <div
              key={group.id}
              role="group"
              aria-label={group.label}
              className="rounded-lg border border-border bg-secondary/40 p-3"
            >
              <Flex
                align="center"
                justify="between"
                gap="sm"
                className="mb-2.5"
              >
                <Flex
                  align="center"
                  className="gap-1.5 text-sm font-medium text-foreground"
                >
                  {group.icon && (
                    <DynamicIcon
                      name={group.icon}
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  {group.label}
                </Flex>
                {showSelectAll && (
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{selectAllLabel}</span>
                    <Switch
                      size="sm"
                      checked={allSelected}
                      disabled={disabled || enabled.length === 0}
                      onCheckedChange={(checked) => selectAll(group, checked)}
                      aria-label={`${selectAllLabel} · ${group.label}`}
                    />
                  </label>
                )}
              </Flex>
              <Flex wrap className="gap-1.5">
                {group.options.map((option) => (
                  <ToggleChip
                    key={option.value}
                    option={option}
                    pressed={current.includes(option.value)}
                    onToggle={() => toggleOption(group, option.value)}
                  />
                ))}
              </Flex>
            </div>
          );
        })}
      </div>
      {renderOtherNote && otherInfo.count > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          {renderOtherNote(otherInfo)}
        </div>
      )}
    </FieldWrapper>
  );
}
