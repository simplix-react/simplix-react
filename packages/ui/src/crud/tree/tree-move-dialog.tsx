import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useMemo, useState } from "react";

import { Stack } from "../../primitives";
import { cn } from "../../utils/cn";
import { useFlatUIComponents } from "../../provider/ui-provider";
import type { TreeMoveConfig } from "./tree-types";
import { filterTreeWithAncestors, getDescendantIds } from "./tree-utils";

// ── Icons ──

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M2 4.5C2 3.67 2.67 3 3.5 3H6l1.5 1.5H12.5C13.33 4.5 14 5.17 14 6V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-primary" aria-hidden="true">
      <path d="M13 5L6.5 11.5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-muted-foreground" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ── Recursive tree item ──

interface TreeItemProps<T> {
  item: T;
  depth: number;
  config: TreeMoveConfig<T>;
  disabledIds: Set<string>;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string | null) => void;
  onToggleExpand: (id: string) => void;
}

function TreeItem<T>({
  item,
  depth,
  config,
  disabledIds,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
}: TreeItemProps<T>) {
  const idField = config.idField ?? ("id" as keyof T & string);
  const childrenField = (config.parentIdField ? "children" : "children") as keyof T & string;
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
        <span className="shrink-0" style={{ width: depth * 20 }} />
        <span
          role="button"
          tabIndex={hasChildren ? 0 : -1}
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm",
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
        <span className="ml-1 truncate">{config.getDisplayName(item)}</span>
        <span className="ml-auto shrink-0">
          {isDisabled && <LockIcon />}
          {isSelected && !isDisabled && <CheckIcon />}
        </span>
      </button>
      {hasChildren && isExpanded && children.map((child) => (
        <TreeItem
          key={String((child as Record<string, unknown>)[idField])}
          item={child}
          depth={depth + 1}
          config={config}
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

// ── TreeMoveDialog ──

export interface TreeMoveDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeData: T[];
  currentItemId: string;
  currentParentId: string | null;
  config: TreeMoveConfig<T>;
  title?: string;
  description?: string;
  rootLabel?: string;
}

export function TreeMoveDialog<T>({
  open,
  onOpenChange,
  treeData,
  currentItemId,
  currentParentId,
  config,
  title,
  description,
  rootLabel,
}: TreeMoveDialogProps<T>) {
  const { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const idField = config.idField ?? ("id" as keyof T & string);

  const [selectedParentId, setSelectedParentId] = useState<string | null>(currentParentId);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Reset state when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedParentId(currentParentId);
      setSearch("");
      setExpandedIds(new Set());
    }
  }

  const disabledIds = useMemo(
    () => {
      const descendants = getDescendantIds(
        treeData,
        currentItemId,
        { idField: idField as keyof T & string, childrenField: "children" as keyof T & string },
      );
      descendants.add(currentItemId);
      return descendants;
    },
    [treeData, currentItemId, idField],
  );

  const itemName = useMemo(() => {
    function find(items: T[]): string | null {
      for (const item of items) {
        if (String((item as Record<string, unknown>)[idField]) === currentItemId) {
          return config.getDisplayName(item);
        }
        const children = ((item as Record<string, unknown>).children as T[] | undefined) ?? [];
        if (children.length > 0) {
          const found = find(children);
          if (found) return found;
        }
      }
      return null;
    }
    return find(treeData) ?? currentItemId;
  }, [treeData, currentItemId, config, idField]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return treeData;
    const lower = search.toLowerCase();
    return filterTreeWithAncestors(
      treeData,
      (item) => config.getDisplayName(item).toLowerCase().includes(lower),
      { idField: idField as keyof T & string, childrenField: "children" as keyof T & string },
    );
  }, [treeData, search, config, idField]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleMove = useCallback(() => {
    if (selectedParentId === currentParentId) {
      onOpenChange(false);
      return;
    }
    config.onMove(currentItemId, selectedParentId);
    onOpenChange(false);
  }, [config, currentItemId, selectedParentId, currentParentId, onOpenChange]);

  const isRootSelected = selectedParentId === null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? t("tree.moveTitle")}</DialogTitle>
          <DialogDescription>
            {description ?? t("tree.moveDescription", { name: itemName })}
          </DialogDescription>
        </DialogHeader>
        <Stack gap="sm">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("tree.searchPlaceholder")}
          />
          <div className="max-h-72 overflow-y-auto rounded-md border p-1">
            <Stack gap="none">
              {/* Root option */}
              <button
                type="button"
                onClick={() => setSelectedParentId(null)}
                className={cn(
                  "flex w-full items-center gap-1 rounded-sm px-2 py-1.5 text-sm",
                  isRootSelected && "bg-accent text-accent-foreground",
                  !isRootSelected && "hover:bg-accent/50",
                )}
              >
                <FolderIcon />
                <span className="ml-1 truncate">{rootLabel ?? t("tree.rootNode")}</span>
                {isRootSelected && (
                  <span className="ml-auto shrink-0"><CheckIcon /></span>
                )}
              </button>
              {/* Tree items */}
              {filteredData.map((item) => (
                <TreeItem
                  key={String((item as Record<string, unknown>)[idField])}
                  item={item}
                  depth={1}
                  config={config}
                  disabledIds={disabledIds}
                  selectedId={selectedParentId}
                  expandedIds={expandedIds}
                  onSelect={setSelectedParentId}
                  onToggleExpand={toggleExpand}
                />
              ))}
            </Stack>
          </div>
        </Stack>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleMove}>{t("tree.move")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
