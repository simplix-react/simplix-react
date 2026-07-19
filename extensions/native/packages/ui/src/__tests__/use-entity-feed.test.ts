// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useEntityFeed } from "../entity-list/use-entity-feed";

interface Row {
  id: string;
  name: string;
}

const ALL_ROWS: Row[] = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Beta" },
  { id: "3", name: "Gamma" },
];

function createFakeListHook(rows: Row[] = ALL_ROWS) {
  const calls: Array<Record<string, unknown>> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useFake = (params?: any) => {
    calls.push(params ?? {});
    const page = (params?.page as number | undefined) ?? 0;
    const size = (params?.size as number | undefined) ?? 20;
    const filtered = params?.["status.in"]
      ? rows.filter((r) => r.name === "Alpha")
      : rows;
    const content = filtered.slice(page * size, (page + 1) * size);
    return {
      data: { content, totalElements: filtered.length },
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: () => Promise.resolve(),
    };
  };
  return { useFake, calls };
}

describe("useEntityFeed", () => {
  it("loads the first page and reports the total", async () => {
    const { useFake } = createFakeListHook();
    const { result } = renderHook(() =>
      useEntityFeed<Row>(useFake, { pageSize: 2 }),
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });
    expect(result.current.total).toBe(3);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.emptyReason).toBeNull();
  });

  it("accumulates pages on loadMore", async () => {
    const { useFake } = createFakeListHook();
    const { result } = renderHook(() =>
      useEntityFeed<Row>(useFake, { pageSize: 2 }),
    );
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.items).toHaveLength(3));
    expect(result.current.items.map((r) => r.id)).toEqual(["1", "2", "3"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("serializes pagination 0-based with size", async () => {
    const { useFake, calls } = createFakeListHook();
    renderHook(() => useEntityFeed<Row>(useFake, { pageSize: 2 }));

    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    expect(calls[0]).toMatchObject({ page: 0, size: 2 });
  });

  it("resets accumulation when a filter changes", async () => {
    const { useFake } = createFakeListHook();
    const { result } = renderHook(() =>
      useEntityFeed<Row>(useFake, { pageSize: 2 }),
    );
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(3));

    act(() => {
      result.current.filters.setValue("status.in", ["A"]);
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });
    expect(result.current.items[0].name).toBe("Alpha");
    expect(result.current.filters.activeCount).toBe(1);
  });

  it("folds the debounced search into the searchable filter key", async () => {
    const { useFake, calls } = createFakeListHook();
    const { result } = renderHook(() =>
      useEntityFeed<Row>(useFake, { pageSize: 2, searchField: "name" }),
    );
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => {
      result.current.setSearch("Al");
    });

    await waitFor(
      () => {
        const last = calls[calls.length - 1];
        expect(last["name.contains"]).toBe("Al");
      },
      { timeout: 2000 },
    );
  });

  it("reports no-data when the source is empty", async () => {
    const { useFake } = createFakeListHook([]);
    const { result } = renderHook(() => useEntityFeed<Row>(useFake));

    await waitFor(() => {
      expect(result.current.emptyReason).toBe("no-data");
    });
  });
});
