import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import type { TreeConfig } from "../../crud/tree/tree-types";
import { filterTreeWithAncestors } from "../../crud/tree/tree-utils";
import { FieldChevron } from "../../base/inputs/field-chevron";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { Stack } from "../../primitives";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

// ── Icons ──

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M2 4.5C2 3.67 2.67 3 3.5 3H6l1.5 1.5H12.5C13.33 4.5 14 5.17 14 6V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-primary" aria-hidden="true">
      <path d="M13 5L6.5 11.5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="h-3 w-3" aria-hidden="true">
      <path
        d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Recursive tree item ──

interface TreeMultiSelectItemProps<T> {
  item: T;
  depth: number;
  idField: string;
  childrenField: string;
  getDisplayName: (item: T) => string | ReactNode;
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

function TreeMultiSelectItem<T>({
  item,
  depth,
  idField,
  childrenField,
  getDisplayName,
  selectedIds,
  expandedIds,
  onToggleSelect,
  onToggleExpand,
}: TreeMultiSelectItemProps<T>) {
  const id = String((item as Record<string, unknown>)[idField]);
  const children = ((item as Record<string, unknown>)[childrenField] as T[] | undefined) ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(id);
  const isSelected = selectedIds.has(id);

  return (
    <>
      {/* Expanding a branch and selecting it are two different acts, so they are two sibling
          controls inside the row rather than one nested in the other — a control inside a control
          leaves the keyboard and assistive technology to guess which of the two a press belongs
          to, and the guesses disagree. */}
      <span
        className={cn(
          "flex w-full items-center gap-1 rounded-sm px-2 py-1.5 text-sm",
          isSelected && "bg-accent text-accent-foreground",
          !isSelected && "hover:bg-accent/50",
        )}
      >
        <span className="shrink-0" style={{ width: depth * 16 }} />
        <button
          type="button"
          tabIndex={hasChildren ? 0 : -1}
          aria-label={hasChildren ? (isExpanded ? "Collapse" : "Expand") : undefined}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            hasChildren ? "text-muted-foreground hover:text-foreground" : "invisible",
          )}
          onClick={() => {
            if (hasChildren) onToggleExpand(id);
          }}
        >
          {hasChildren ? (isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : null}
        </button>
        <button
          type="button"
          onClick={() => onToggleSelect(id)}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1 rounded-sm text-start",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        >
          <FolderIcon />
          <span className="ml-0.5 truncate">{getDisplayName(item)}</span>
          {isSelected && (
            <span className="ml-auto shrink-0"><CheckIcon /></span>
          )}
        </button>
      </span>
      {hasChildren && isExpanded && children.map((child) => (
        <TreeMultiSelectItem
          key={String((child as Record<string, unknown>)[idField])}
          item={child}
          depth={depth + 1}
          idField={idField}
          childrenField={childrenField}
          getDisplayName={getDisplayName}
          selectedIds={selectedIds}
          expandedIds={expandedIds}
          onToggleSelect={onToggleSelect}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </>
  );
}

// ── TreeMultiSelectField ──

export interface TreeMultiSelectFieldProps<T> extends CommonFieldProps {
  /** Currently selected item ids. */
  value: string[];
  /** Called with the full selection whenever an item is toggled or removed. */
  onChange: (value: string[]) => void;
  treeData: T[];
  isLoading?: boolean;
  config?: Pick<TreeConfig<T>, "idField" | "childrenField">;
  getDisplayName?: (item: T) => string | ReactNode;
  placeholder?: string;
  /** Maximum number of selections allowed. */
  maxCount?: number;
}

/**
 * Multi-select variant of {@link TreeSelectField}: picks any number of nodes
 * from a hierarchical dataset. Selected nodes render as removable badge chips
 * in the trigger; the popover keeps the tree open across toggles and supports
 * search with ancestor-preserving filtering.
 *
 * @example
 * ```tsx
 * <TreeMultiSelectField<OrgNode>
 *   label="Organizations"
 *   value={orgIds}
 *   onChange={setOrgIds}
 *   treeData={orgTree}
 *   config={{ idField: "orgId", childrenField: "children" }}
 *   getDisplayName={(org) => org.orgName}
 * />
 * ```
 */
export function TreeMultiSelectField<T>({
  value,
  onChange,
  treeData,
  isLoading,
  config,
  getDisplayName: getDisplayNameProp,
  placeholder,
  maxCount,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: TreeMultiSelectFieldProps<T>) {
  const { Badge, Input, Popover, PopoverAnchor, PopoverTrigger, PopoverContent } = useFlatUIComponents();
  const boxRef = useRef<HTMLSpanElement>(null);
  const { t } = useTranslation("simplix/ui");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const idField = (config?.idField ?? "id") as string;
  const childrenField = (config?.childrenField ?? "children") as string;

  const getDisplayName = useMemo(
    () => getDisplayNameProp ?? ((item: T) => String((item as Record<string, unknown>).name ?? (item as Record<string, unknown>)[idField])),
    [getDisplayNameProp, idField],
  );

  const selectedIds = useMemo(() => new Set(value), [value]);

  const labelById = useMemo(() => {
    const map = new Map<string, ReactNode>();
    function walk(items: T[]) {
      for (const item of items) {
        map.set(String((item as Record<string, unknown>)[idField]), getDisplayName(item));
        const children = ((item as Record<string, unknown>)[childrenField] as T[] | undefined) ?? [];
        if (children.length > 0) walk(children);
      }
    }
    walk(treeData);
    return map;
  }, [treeData, idField, childrenField, getDisplayName]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return treeData;
    const lower = search.toLowerCase();
    return filterTreeWithAncestors(
      treeData,
      (item) => String(getDisplayName(item) ?? "").toLowerCase().includes(lower),
      { idField: idField as keyof T & string, childrenField: childrenField as keyof T & string },
    );
  }, [treeData, search, getDisplayName, idField, childrenField]);

  useEffect(() => {
    if (!search.trim()) {
      setExpandedIds(new Set());
      return;
    }
    const allIds = new Set<string>();
    function collectIds(items: T[]) {
      for (const item of items) {
        allIds.add(String((item as Record<string, unknown>)[idField]));
        const children = ((item as Record<string, unknown>)[childrenField] as T[]) ?? [];
        if (children.length > 0) collectIds(children);
      }
    }
    collectIds(filteredData);
    setExpandedIds(allIds);
  }, [filteredData, search, idField, childrenField]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelect = useCallback(
    (id: string) => {
      if (selectedIds.has(id)) {
        onChange(value.filter((v) => v !== id));
      } else {
        if (maxCount != null && value.length >= maxCount) return;
        onChange([...value, id]);
      }
    },
    [value, selectedIds, onChange, maxCount],
  );

  const removeSelected = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v !== id));
    },
    [value, onChange],
  );

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
      {({ id, labelId }) => (
        <Popover open={open} onOpenChange={(v) => { if (disabled) return; setOpen(v); }}>
          {/* The box holds a remove button per selected chip, so it anchors the
              popover and the chevron beside them triggers it. A trigger on the box
              would nest a control inside a control, and the keyboard and assistive
              technology would have to guess which of the two a press belongs to. */}
          <PopoverAnchor asChild>
            <span
              ref={boxRef}
              className={cn(
                "flex min-h-8 w-full items-center gap-1 rounded-md border border-input bg-background px-3 py-1 text-sm",
                "focus-within:border-foreground",
                disabled && "cursor-not-allowed opacity-50",
                error && "border-destructive focus-within:border-destructive",
              )}
              onMouseDown={(e) => {
                // A press on the box's own surface reaches the same popover the
                // chevron opens; a press on a chip's remove button does not.
                if (disabled || (e.target as HTMLElement).closest("button")) return;
                e.preventDefault();
                setOpen((v) => !v);
              }}
            >
              <span className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
                {value.length === 0 && (
                  <span className="truncate text-muted-foreground">
                    {placeholder ?? t("tree.searchPlaceholder")}
                  </span>
                )}
                {value.map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="shrink-0 gap-0.5 pr-0.5 text-[11px] py-0 h-5"
                  >
                    {labelById.get(id) ?? id}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeSelected(id)}
                        className="ml-0.5 rounded-sm hover:bg-muted"
                        aria-label={t("field.removeOption", {
                          label: String(labelById.get(id) ?? id),
                        })}
                      >
                        <RemoveIcon />
                      </button>
                    )}
                  </Badge>
                ))}
              </span>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  id={id}
                  role="combobox"
                  aria-expanded={open}
                  aria-labelledby={labelId}
                  aria-label={variantProps.layout === "hidden" ? label : undefined}
                  disabled={disabled}
                  className="flex shrink-0 items-center rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <FieldChevron />
                </button>
              </PopoverTrigger>
            </span>
          </PopoverAnchor>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            // The box is the anchor, not the trigger, so Radix reads a press on a
            // chip as an outside press. Keep those from dismissing.
            onInteractOutside={(e) => {
              if (boxRef.current?.contains(e.target as Node)) e.preventDefault();
            }}
          >
            <Stack gap="none" className="p-2">
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("tree.searchPlaceholder")}
                className="mb-2"
              />
              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t("common.loading")}
                  </p>
                ) : filteredData.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t("list.noResults")}
                  </p>
                ) : (
                  filteredData.map((item) => (
                    <TreeMultiSelectItem
                      key={String((item as Record<string, unknown>)[idField])}
                      item={item}
                      depth={0}
                      idField={idField}
                      childrenField={childrenField}
                      getDisplayName={getDisplayName}
                      selectedIds={selectedIds}
                      expandedIds={expandedIds}
                      onToggleSelect={toggleSelect}
                      onToggleExpand={toggleExpand}
                    />
                  ))
                )}
              </div>
            </Stack>
          </PopoverContent>
        </Popover>
      )}
    </FieldWrapper>
  );
}
