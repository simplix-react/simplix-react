// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock @dnd-kit modules
vi.mock("@dnd-kit/core", () => ({
  KeyboardSensor: class {},
  MouseSensor: class {},
  TouchSensor: class {},
  useSensor: vi.fn().mockReturnValue({}),
  useSensors: vi.fn().mockReturnValue([]),
}));
vi.mock("@dnd-kit/sortable", () => ({
  arrayMove: (arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
}));

import { useReorder } from "../../crud/reorder/use-reorder";

interface TestItem {
  id: string;
  displayOrder: number;
}

function createConfig(onReorder = vi.fn()) {
  return {
    orderField: "displayOrder" as keyof TestItem & string,
    idField: "id" as keyof TestItem & string,
    onReorder,
  };
}

describe("useReorder", () => {
  const items: TestItem[] = [
    { id: "a", displayOrder: 1 },
    { id: "b", displayOrder: 2 },
    { id: "c", displayOrder: 3 },
  ];

  it("returns isDragEnabled=true when sorted by orderField asc", () => {
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(),
        data: items,
        sort: { field: "displayOrder", direction: "asc" },
      }),
    );
    expect(result.current.isDragEnabled).toBe(true);
  });

  it("returns isDragEnabled=false when sorted by different field", () => {
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(),
        data: items,
        sort: { field: "name", direction: "asc" },
      }),
    );
    expect(result.current.isDragEnabled).toBe(false);
  });

  it("returns isDragEnabled=false when sort direction is desc", () => {
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(),
        data: items,
        sort: { field: "displayOrder", direction: "desc" },
      }),
    );
    expect(result.current.isDragEnabled).toBe(false);
  });

  it("returns isDragEnabled=false when sort is null", () => {
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(),
        data: items,
        sort: null,
      }),
    );
    expect(result.current.isDragEnabled).toBe(false);
  });

  it("getRowId extracts id from row", () => {
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(),
        data: items,
        sort: null,
      }),
    );
    expect(result.current.getRowId(items[0])).toBe("a");
    expect(result.current.getRowId(items[1])).toBe("b");
  });

  it("optimisticData defaults to input data", () => {
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(),
        data: items,
        sort: null,
      }),
    );
    expect(result.current.optimisticData).toBe(items);
  });

  it("handleDragStart sets activeId", () => {
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(),
        data: items,
        sort: { field: "displayOrder", direction: "asc" },
      }),
    );

    expect(result.current.activeId).toBeNull();

    act(() => {
      result.current.handleDragStart({
        active: { id: "b", data: { current: undefined }, rect: { current: { initial: null, translated: null } } },
      } as never);
    });

    expect(result.current.activeId).toBe("b");
  });

  it("handleDragEnd reorders data and calls onReorder", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(onReorder),
        data: items,
        sort: { field: "displayOrder", direction: "asc" },
      }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: { id: "c" },
      } as never);
    });

    expect(onReorder).toHaveBeenCalledTimes(1);
    const reorderedIds = onReorder.mock.calls[0][0].map((r: TestItem) => r.id);
    expect(reorderedIds).toEqual(["b", "c", "a"]);
  });

  it("handleDragEnd does nothing when over is null", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(onReorder),
        data: items,
        sort: { field: "displayOrder", direction: "asc" },
      }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: null,
      } as never);
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("handleDragEnd does nothing when dropped on same position", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(onReorder),
        data: items,
        sort: { field: "displayOrder", direction: "asc" },
      }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "a" },
        over: { id: "a" },
      } as never);
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("activateOrderSort calls onSortChange with order field asc", () => {
    const onSortChange = vi.fn();
    const { result } = renderHook(() =>
      useReorder({
        config: createConfig(),
        data: items,
        sort: null,
        onSortChange,
      }),
    );

    act(() => result.current.activateOrderSort());
    expect(onSortChange).toHaveBeenCalledWith({
      field: "displayOrder",
      direction: "asc",
    });
  });
});
