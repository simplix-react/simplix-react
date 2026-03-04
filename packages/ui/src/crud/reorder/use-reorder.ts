import {
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ReorderConfig, SortState } from "../shared";

export interface UseReorderOptions<T> {
  config: ReorderConfig<T>;
  data: T[];
  sort: SortState | null;
  onSortChange?: (sort: SortState) => void;
}

export interface UseReorderResult<T> {
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  isDragEnabled: boolean;
  activeId: string | null;
  activateOrderSort: () => void;
  getRowId: (row: T) => string;
  /** Data with optimistic reorder applied. Use this for rendering. */
  optimisticData: T[];
}

export function useReorder<T>({
  config,
  data,
  sort,
  onSortChange,
}: UseReorderOptions<T>): UseReorderResult<T> {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [optimisticOrder, setOptimisticOrder] = useState<string[] | null>(null);
  const prevDataRef = useRef(data);
  const idField = config.idField ?? ("id" as keyof T & string);

  const getRowId = useCallback(
    (row: T) => String((row as Record<string, unknown>)[idField]),
    [idField],
  );

  // Clear optimistic state when server data changes
  useEffect(() => {
    if (data !== prevDataRef.current) {
      prevDataRef.current = data;
      setOptimisticOrder(null);
    }
  }, [data]);

  const optimisticData = useMemo(() => {
    if (!optimisticOrder) return data;
    const byId = new Map(data.map((row) => [getRowId(row), row]));
    const ordered: T[] = [];
    for (const id of optimisticOrder) {
      const row = byId.get(id);
      if (row) ordered.push(row);
    }
    return ordered;
  }, [data, optimisticOrder, getRowId]);

  const isDragEnabled = useMemo(
    () => sort?.field === config.orderField && sort?.direction === "asc",
    [sort, config.orderField],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentData = optimisticOrder
        ? optimisticData
        : data;

      const oldIndex = currentData.findIndex((row) => getRowId(row) === String(active.id));
      const newIndex = currentData.findIndex((row) => getRowId(row) === String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(currentData, oldIndex, newIndex);
      setOptimisticOrder(reordered.map((row) => getRowId(row)));
      config.onReorder(reordered);
    },
    [data, optimisticData, optimisticOrder, getRowId, config],
  );

  const activateOrderSort = useCallback(() => {
    onSortChange?.({ field: config.orderField, direction: "asc" });
  }, [onSortChange, config.orderField]);

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
    isDragEnabled,
    activeId,
    activateOrderSort,
    getRowId,
    optimisticData,
  };
}
