// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useListDetailState } from "../../crud/patterns/use-list-detail-state";

describe("useListDetailState", () => {
  it("initializes with 'empty' view and null selectedId", () => {
    const { result } = renderHook(() => useListDetailState());

    expect(result.current.view).toBe("empty");
    expect(result.current.selectedId).toBeNull();
  });

  it("accepts initial view option", () => {
    const { result } = renderHook(() =>
      useListDetailState({ initialView: "new" }),
    );

    expect(result.current.view).toBe("new");
  });

  it("showDetail sets view to 'detail' with the given id", () => {
    const { result } = renderHook(() => useListDetailState());

    act(() => result.current.showDetail("item-42"));

    expect(result.current.view).toBe("detail");
    expect(result.current.selectedId).toBe("item-42");
  });

  it("showList resets to empty view with null id", () => {
    const { result } = renderHook(() => useListDetailState());

    act(() => result.current.showDetail("item-1"));
    act(() => result.current.showList());

    expect(result.current.view).toBe("empty");
    expect(result.current.selectedId).toBeNull();
  });

  it("showNew sets view to 'new' with null id", () => {
    const { result } = renderHook(() => useListDetailState());

    act(() => result.current.showNew());

    expect(result.current.view).toBe("new");
    expect(result.current.selectedId).toBeNull();
  });

  it("showEdit sets view to 'edit' with the given id", () => {
    const { result } = renderHook(() => useListDetailState());

    act(() => result.current.showEdit("item-7"));

    expect(result.current.view).toBe("edit");
    expect(result.current.selectedId).toBe("item-7");
  });

  it("supports full workflow: list -> detail -> edit -> list", () => {
    const { result } = renderHook(() => useListDetailState());

    // Start empty
    expect(result.current.view).toBe("empty");

    // Select an item
    act(() => result.current.showDetail("item-1"));
    expect(result.current.view).toBe("detail");
    expect(result.current.selectedId).toBe("item-1");

    // Edit the item
    act(() => result.current.showEdit("item-1"));
    expect(result.current.view).toBe("edit");
    expect(result.current.selectedId).toBe("item-1");

    // Go back to list
    act(() => result.current.showList());
    expect(result.current.view).toBe("empty");
    expect(result.current.selectedId).toBeNull();
  });

  it("can switch directly between items", () => {
    const { result } = renderHook(() => useListDetailState());

    act(() => result.current.showDetail("item-1"));
    act(() => result.current.showDetail("item-2"));

    expect(result.current.selectedId).toBe("item-2");
    expect(result.current.view).toBe("detail");
  });
});
