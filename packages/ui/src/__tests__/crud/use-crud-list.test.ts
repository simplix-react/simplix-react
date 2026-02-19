// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useCrudList, type ListHook } from "../../crud/list/use-crud-list";

function createMockListHook<T>(data: T[], isLoading = false, error: Error | null = null): ListHook<T> {
  return vi.fn().mockReturnValue({ data, isLoading, error });
}

describe("useCrudList", () => {
  describe("initial state", () => {
    it("returns data from the list hook", () => {
      const items = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
      const useList = createMockListHook(items);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.data).toEqual(items);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("returns empty data when list hook returns undefined", () => {
      const useList = createMockListHook(undefined as unknown as never[]);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.data).toEqual([]);
    });

    it("passes loading and error states through", () => {
      const err = new Error("fetch failed");
      const useList = createMockListHook([], true, err);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(err);
    });

    it("applies default sort from options", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() =>
        useCrudList(useList, { defaultSort: { field: "name", direction: "desc" } }),
      );

      expect(result.current.sort.field).toBe("name");
      expect(result.current.sort.direction).toBe("desc");
    });

    it("applies default page size from options", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList, { defaultPageSize: 25 }));

      expect(result.current.pagination.pageSize).toBe(25);
    });
  });

  describe("filters", () => {
    it("initializes with empty search and values", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.filters.search).toBe("");
      expect(result.current.filters.values).toEqual({});
    });

    it("updates search", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.filters.setSearch("hello"));
      expect(result.current.filters.search).toBe("hello");
    });

    it("sets filter values", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.filters.setValue("status", "active"));
      expect(result.current.filters.values).toEqual({ status: "active" });
    });

    it("clears all filters", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => {
        result.current.filters.setSearch("test");
        result.current.filters.setValue("role", "admin");
      });

      act(() => result.current.filters.clear());
      expect(result.current.filters.search).toBe("");
      expect(result.current.filters.values).toEqual({});
    });
  });

  describe("sort", () => {
    it("initializes with null field and asc direction", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.sort.field).toBeNull();
      expect(result.current.sort.direction).toBe("asc");
    });

    it("sets sort field and direction", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.sort.setSort("name", "desc"));
      expect(result.current.sort.field).toBe("name");
      expect(result.current.sort.direction).toBe("desc");
    });

    it("toggleSort: sets new field to asc", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.sort.toggleSort("name"));
      expect(result.current.sort.field).toBe("name");
      expect(result.current.sort.direction).toBe("asc");
    });

    it("toggleSort: toggles direction for same field", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.sort.toggleSort("name"));
      expect(result.current.sort.direction).toBe("asc");

      act(() => result.current.sort.toggleSort("name"));
      expect(result.current.sort.direction).toBe("desc");

      act(() => result.current.sort.toggleSort("name"));
      expect(result.current.sort.direction).toBe("asc");
    });

    it("toggleSort: resets to asc when switching fields", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.sort.setSort("name", "desc"));
      act(() => result.current.sort.toggleSort("age"));
      expect(result.current.sort.field).toBe("age");
      expect(result.current.sort.direction).toBe("asc");
    });
  });

  describe("pagination", () => {
    it("initializes with page 1 and default page size 10", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.pageSize).toBe(10);
    });

    it("sets page", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.pagination.setPage(3));
      expect(result.current.pagination.page).toBe(3);
    });

    it("sets page size", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.pagination.setPageSize(50));
      expect(result.current.pagination.pageSize).toBe(50);
    });

    it("computes totalPages correctly", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      // With 0 items, totalPages is at least 1
      expect(result.current.pagination.totalPages).toBe(1);
    });
  });

  describe("selection", () => {
    it("initializes with empty selection", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.selection.selected.size).toBe(0);
    });

    it("toggles item selection on/off", () => {
      const items = [{ id: 1 }, { id: 2 }];
      const useList = createMockListHook(items);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.selection.toggle(0));
      expect(result.current.selection.isSelected(0)).toBe(true);
      expect(result.current.selection.isSelected(1)).toBe(false);

      act(() => result.current.selection.toggle(0));
      expect(result.current.selection.isSelected(0)).toBe(false);
    });

    it("toggleAll selects all when none are selected", () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const useList = createMockListHook(items);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.selection.toggleAll(items));
      expect(result.current.selection.selected.size).toBe(3);
      expect(result.current.selection.isSelected(0)).toBe(true);
      expect(result.current.selection.isSelected(1)).toBe(true);
      expect(result.current.selection.isSelected(2)).toBe(true);
    });

    it("toggleAll deselects all when all are selected", () => {
      const items = [{ id: 1 }, { id: 2 }];
      const useList = createMockListHook(items);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.selection.toggleAll(items));
      expect(result.current.selection.selected.size).toBe(2);

      act(() => result.current.selection.toggleAll(items));
      expect(result.current.selection.selected.size).toBe(0);
    });

    it("clears selection", () => {
      const items = [{ id: 1 }, { id: 2 }];
      const useList = createMockListHook(items);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => {
        result.current.selection.toggle(0);
        result.current.selection.toggle(1);
      });
      expect(result.current.selection.selected.size).toBe(2);

      act(() => result.current.selection.clear());
      expect(result.current.selection.selected.size).toBe(0);
    });
  });

  describe("emptyReason", () => {
    it("returns null when data exists", () => {
      const useList = createMockListHook([{ id: 1 }]);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.emptyReason).toBeNull();
    });

    it("returns null when loading", () => {
      const useList = createMockListHook([], true);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.emptyReason).toBeNull();
    });

    it("returns 'no-search' when search is active but no results", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.filters.setSearch("nonexistent"));
      expect(result.current.emptyReason).toBe("no-search");
    });

    it("returns 'no-filter' when filters are active but no results", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.filters.setValue("status", "archived"));
      expect(result.current.emptyReason).toBe("no-filter");
    });

    it("returns 'no-data' when empty with no filters", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      expect(result.current.emptyReason).toBe("no-data");
    });
  });

  describe("server mode (default)", () => {
    it("passes query params to list hook", () => {
      const useList = createMockListHook([]);
      renderHook(() => useCrudList(useList));

      expect(useList).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: { type: "offset", page: 1, limit: 10 },
        }),
      );
    });

    it("includes search in params when set", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.filters.setSearch("test"));

      expect(useList).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ _search: "test" }),
        }),
      );
    });

    it("includes sort in params when set", () => {
      const useList = createMockListHook([]);
      const { result } = renderHook(() => useCrudList(useList));

      act(() => result.current.sort.setSort("name", "desc"));

      expect(useList).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sort: { field: "name", direction: "desc" },
        }),
      );
    });
  });

  describe("client mode", () => {
    it("passes undefined to list hook in client mode", () => {
      const useList = createMockListHook([]);
      renderHook(() => useCrudList(useList, { stateMode: "client" }));

      expect(useList).toHaveBeenCalledWith(undefined);
    });

    it("filters data client-side by search", () => {
      const items = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Alice Jr" },
      ];
      const useList = createMockListHook(items);
      const { result } = renderHook(() =>
        useCrudList(useList, { stateMode: "client" }),
      );

      act(() => result.current.filters.setSearch("alice"));
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0]).toEqual({ id: 1, name: "Alice" });
    });

    it("filters data client-side by filter values", () => {
      const items = [
        { id: 1, status: "active" },
        { id: 2, status: "inactive" },
        { id: 3, status: "active" },
      ];
      const useList = createMockListHook(items);
      const { result } = renderHook(() =>
        useCrudList(useList, { stateMode: "client" }),
      );

      act(() => result.current.filters.setValue("status", "active"));
      expect(result.current.data).toHaveLength(2);
    });

    it("sorts data client-side", () => {
      const items = [
        { id: 3, name: "Charlie" },
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const useList = createMockListHook(items);
      const { result } = renderHook(() =>
        useCrudList(useList, { stateMode: "client" }),
      );

      act(() => result.current.sort.setSort("name", "asc"));
      expect(result.current.data.map((d: { name: string }) => d.name)).toEqual([
        "Alice", "Bob", "Charlie",
      ]);

      act(() => result.current.sort.setSort("name", "desc"));
      expect(result.current.data.map((d: { name: string }) => d.name)).toEqual([
        "Charlie", "Bob", "Alice",
      ]);
    });

    it("paginates data client-side", () => {
      const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
      const useList = createMockListHook(items);
      const { result } = renderHook(() =>
        useCrudList(useList, { stateMode: "client", defaultPageSize: 10 }),
      );

      expect(result.current.data).toHaveLength(10);
      expect(result.current.pagination.total).toBe(25);
      expect(result.current.pagination.totalPages).toBe(3);

      act(() => result.current.pagination.setPage(3));
      expect(result.current.data).toHaveLength(5);
    });
  });
});
