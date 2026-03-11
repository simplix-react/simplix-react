import { useTranslation } from "@simplix-react/i18n/react";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import type { TreeConfig } from "../../crud/tree/tree-types";
import { filterTreeWithAncestors, getDescendantIds } from "../../crud/tree/tree-utils";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../base";
import { Flex, Stack } from "../../primitives";
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

function ClearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="h-3 w-3" aria-hidden="true">
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

interface TreeSelectItemProps<T> {
  item: T;
  depth: number;
  idField: string;
  childrenField: string;
  getDisplayName: (item: T) => string;
  disabledIds: Set<string>;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

function TreeSelectItem<T>({
  item,
  depth,
  idField,
  childrenField,
  getDisplayName,
  disabledIds,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
}: TreeSelectItemProps<T>) {
  const id = String((item as Record<string, unknown>)[idField]);
  const children = ((item as Record<string, unknown>)[childrenField] as T[] | undefined) ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(id);
  const isDisabled = disabledIds.has(id);
  const isSelected = selectedId === id;

  return (
    <>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => !isDisabled && onSelect(id)}
        className={cn(
          "flex w-full items-center gap-1 rounded-sm px-2 py-1.5 text-sm",
          isSelected && "bg-accent text-accent-foreground",
          !isSelected && !isDisabled && "hover:bg-accent/50",
          isDisabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="shrink-0" style={{ width: depth * 16 }} />
        <span
          role="button"
          tabIndex={hasChildren ? 0 : -1}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center",
            hasChildren ? "text-muted-foreground hover:text-foreground" : "invisible",
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(id);
          }}
          onKeyDown={(e) => {
            if (hasChildren && (e.key === "Enter" || e.key === " ")) {
              e.stopPropagation();
              onToggleExpand(id);
            }
          }}
        >
          {hasChildren ? (isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : null}
        </span>
        <FolderIcon />
        <span className="ml-0.5 truncate">{getDisplayName(item)}</span>
        {isSelected && (
          <span className="ml-auto shrink-0"><CheckIcon /></span>
        )}
      </button>
      {hasChildren && isExpanded && children.map((child) => (
        <TreeSelectItem
          key={String((child as Record<string, unknown>)[idField])}
          item={child}
          depth={depth + 1}
          idField={idField}
          childrenField={childrenField}
          getDisplayName={getDisplayName}
          disabledIds={disabledIds}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </>
  );
}

// ── TreeSelectField ──

export interface TreeSelectFieldProps<T> extends CommonFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  treeData: T[];
  isLoading?: boolean;
  config?: Pick<TreeConfig<T>, "idField" | "childrenField">;
  getDisplayName?: (item: T) => string;
  disabledItemId?: string;
  placeholder?: string;
}

export function TreeSelectField<T>({
  value,
  onChange,
  treeData,
  isLoading,
  config,
  getDisplayName: getDisplayNameProp,
  disabledItemId,
  placeholder,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: TreeSelectFieldProps<T>) {
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

  const disabledIds = useMemo(() => {
    if (!disabledItemId) return new Set<string>();
    const descendants = getDescendantIds(
      treeData,
      disabledItemId,
      { idField: idField as keyof T & string, childrenField: childrenField as keyof T & string },
    );
    descendants.add(disabledItemId);
    return descendants;
  }, [treeData, disabledItemId, idField, childrenField]);

  const selectedLabel = useMemo(() => {
    if (!value) return "";
    function find(items: T[]): string | null {
      for (const item of items) {
        if (String((item as Record<string, unknown>)[idField]) === value) {
          return getDisplayName(item);
        }
        const children = ((item as Record<string, unknown>)[childrenField] as T[] | undefined) ?? [];
        if (children.length > 0) {
          const found = find(children);
          if (found) return found;
        }
      }
      return null;
    }
    return find(treeData) ?? value;
  }, [value, treeData, idField, childrenField, getDisplayName]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return treeData;
    const lower = search.toLowerCase();
    return filterTreeWithAncestors(
      treeData,
      (item) => getDisplayName(item).toLowerCase().includes(lower),
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

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setSearch("");
  }, [onChange]);

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <span
            className={cn(
              "relative flex h-8 w-full items-center rounded-md border border-input bg-background px-3 text-sm",
              "focus-within:border-foreground",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive focus-within:border-destructive",
            )}
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value ? selectedLabel : (placeholder ?? t("tree.searchPlaceholder"))}
            </span>
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                aria-label="Clear selection"
              >
                <ClearIcon />
              </button>
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
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
                  <TreeSelectItem
                    key={String((item as Record<string, unknown>)[idField])}
                    item={item}
                    depth={0}
                    idField={idField}
                    childrenField={childrenField}
                    getDisplayName={getDisplayName}
                    disabledIds={disabledIds}
                    selectedId={value}
                    expandedIds={expandedIds}
                    onSelect={handleSelect}
                    onToggleExpand={toggleExpand}
                  />
                ))
              )}
            </div>
          </Stack>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}
