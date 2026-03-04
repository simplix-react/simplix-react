import { closestCenter, DndContext, type DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../base";
import { Flex, Stack } from "../../primitives";
import { cn } from "../../utils/cn";
import type { TreeReorderConfig } from "./tree-types";

// ── Grip icon ──

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="shrink-0" aria-hidden="true">
      <circle cx="5" cy="4" r="1.5" />
      <circle cx="11" cy="4" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="11" cy="12" r="1.5" />
    </svg>
  );
}

// ── Sortable item ──

interface SortableItemProps {
  id: string;
  label: string;
}

function SortableItem({ id, label }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background px-3 py-2",
        isDragging && "z-10 shadow-md opacity-90",
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>
      <span className="truncate text-sm">{label}</span>
    </div>
  );
}

// ── TreeReorderDialog ──

export interface TreeReorderDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
  siblings: T[];
  config: TreeReorderConfig<T>;
  getDisplayName: (item: T) => string;
  title?: string;
  description?: string;
}

export function TreeReorderDialog<T>({
  open,
  onOpenChange,
  parentId,
  siblings,
  config,
  getDisplayName,
  title,
  description,
}: TreeReorderDialogProps<T>) {
  const { t } = useTranslation("simplix/ui");
  const idField = config.idField ?? ("id" as keyof T & string);

  const [items, setItems] = useState(() =>
    siblings.map((s) => ({
      id: String((s as Record<string, unknown>)[idField]),
      data: s,
    })),
  );

  // Reset items when dialog opens with new siblings
  const [prevSiblings, setPrevSiblings] = useState(siblings);
  if (siblings !== prevSiblings) {
    setPrevSiblings(siblings);
    setItems(
      siblings.map((s) => ({
        id: String((s as Record<string, unknown>)[idField]),
        data: s,
      })),
    );
  }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === String(active.id));
      const newIndex = prev.findIndex((item) => item.id === String(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    config.onReorder(
      parentId,
      items.map((item) => item.data),
    );
    onOpenChange(false);
  }, [config, parentId, items, onOpenChange]);

  const sortableIds = items.map((item) => item.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? t("tree.reorderTitle")}</DialogTitle>
          <DialogDescription>{description ?? t("tree.reorderDescription")}</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 overflow-y-auto py-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <Stack gap="xs">
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    label={getDisplayName(item.data)}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleConfirm}>{t("tree.confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
