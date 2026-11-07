// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useCrudNavigation, useCrudPageState } from "../../crud/patterns/use-crud-page";

describe("useCrudNavigation", () => {
  it("parses empty search as list view with no selected id", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useCrudNavigation({}, onNavigate),
    );

    expect(result.current.view).toBe("list");
    expect(result.current.selectedId).toBeUndefined();
  });

  it("parses detail mode with id", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useCrudNavigation({ id: "42" }, onNavigate),
    );

    expect(result.current.view).toBe("detail");
    expect(result.current.selectedId).toBe("42");
  });

  it("parses new mode", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useCrudNavigation({ mode: "new" }, onNavigate),
    );

    expect(result.current.view).toBe("new");
    expect(result.current.selectedId).toBeUndefined();
  });

  it("parses edit mode with id", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useCrudNavigation({ id: "7", mode: "edit" }, onNavigate),
    );

    expect(result.current.view).toBe("edit");
    expect(result.current.selectedId).toBe("7");
  });

  it("showList navigates to empty search (list view)", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useCrudNavigation({ id: "42" }, onNavigate),
    );

    act(() => result.current.showList());
    expect(onNavigate).toHaveBeenCalledWith({});
  });

  it("showDetail navigates with id and detail mode", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useCrudNavigation({}, onNavigate),
    );

    act(() => result.current.showDetail("99"));
    expect(onNavigate).toHaveBeenCalledWith({ id: "99" });
  });

  it("showNew navigates with new mode", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useCrudNavigation({}, onNavigate),
    );

    act(() => result.current.showNew());
    expect(onNavigate).toHaveBeenCalledWith({ mode: "new" });
  });

  it("showEdit navigates with id and edit mode", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useCrudNavigation({}, onNavigate),
    );

    act(() => result.current.showEdit("5"));
    expect(onNavigate).toHaveBeenCalledWith({ id: "5", mode: "edit" });
  });
});

describe("useCrudNavigation and the list filters", () => {
  const filters = { "status.in": ["FAILED"] };

  it("hands the address's filters over", () => {
    const { result } = renderHook(() => useCrudNavigation({ filters }, vi.fn()));
    expect(result.current.filters).toEqual(filters);
    expect(renderHook(() => useCrudNavigation({}, vi.fn())).result.current.filters).toBeUndefined();
  });

  // Opening a record from a filtered list and closing it returns to the same filtered list.
  it("carries them through every view", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useCrudNavigation({ tab: "t", filters }, onNavigate));
    act(() => result.current.showDetail("7"));
    expect(onNavigate).toHaveBeenLastCalledWith({ id: "7", tab: "t", filters });
    act(() => result.current.showEdit("7"));
    expect(onNavigate).toHaveBeenLastCalledWith({ id: "7", mode: "edit", tab: "t", filters });
    act(() => result.current.showNew());
    expect(onNavigate).toHaveBeenLastCalledWith({ mode: "new", tab: "t", filters });
    act(() => result.current.showList());
    expect(onNavigate).toHaveBeenLastCalledWith({ tab: "t", filters });
  });

  it("writes new filters with replace and keeps the rest of the address", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useCrudNavigation({ id: "7", tab: "t", filters }, onNavigate));
    act(() => result.current.setFilters({ "kind.equals": "A" }));
    expect(onNavigate).toHaveBeenCalledWith({ id: "7", tab: "t", filters: { "kind.equals": "A" } }, { replace: true });
    act(() => result.current.setFilters(undefined));
    expect(onNavigate).toHaveBeenLastCalledWith({ id: "7", tab: "t", filters: undefined }, { replace: true });
  });

  it("pushes a view change as it always did, with no second argument", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useCrudNavigation({ filters }, onNavigate));
    act(() => result.current.showDetail("7"));
    expect(onNavigate.mock.calls.at(-1)).toHaveLength(1);
  });

  it("keeps its callbacks while the filters stay the same content", () => {
    const onNavigate = vi.fn();
    const { result, rerender } = renderHook(({ search }) => useCrudNavigation(search, onNavigate), {
      initialProps: { search: { filters: { "status.in": ["FAILED"] } } },
    });
    const first = result.current.showDetail;
    rerender({ search: { filters: { "status.in": ["FAILED"] } } });
    expect(result.current.showDetail).toBe(first);
    rerender({ search: { filters: { "status.in": ["PAUSED"] } } });
    expect(result.current.showDetail).not.toBe(first);
  });
});

describe("useCrudPageState", () => {
  function createNav(view: string, selectedId?: string) {
    return {
      view: view as "list" | "detail" | "new" | "edit",
      selectedId,
      showList: vi.fn(),
      showDetail: vi.fn(),
      showNew: vi.fn(),
      showEdit: vi.fn(),
    };
  }

  it("returns closePanel as undefined for page variant", () => {
    const nav = createNav("list");
    const { result } = renderHook(() =>
      useCrudPageState("page", nav),
    );
    expect(result.current.closePanel).toBeUndefined();
  });

  it("returns closePanel as showList for panel variant", () => {
    const nav = createNav("detail", "42");
    const { result } = renderHook(() =>
      useCrudPageState("panel", nav),
    );
    expect(result.current.closePanel).toBe(nav.showList);
  });

  it("returns closePanel as showList for dialog variant", () => {
    const nav = createNav("detail", "42");
    const { result } = renderHook(() =>
      useCrudPageState("dialog", nav),
    );
    expect(result.current.closePanel).toBe(nav.showList);
  });

  it("maps list view to empty in state", () => {
    const nav = createNav("list");
    const { result } = renderHook(() =>
      useCrudPageState("panel", nav),
    );
    expect(result.current.state.view).toBe("empty");
  });

  it("maps detail view to detail in state", () => {
    const nav = createNav("detail", "42");
    const { result } = renderHook(() =>
      useCrudPageState("panel", nav),
    );
    expect(result.current.state.view).toBe("detail");
    expect(result.current.state.selectedId).toBe("42");
  });

  it("maps new view to new in state", () => {
    const nav = createNav("new");
    const { result } = renderHook(() =>
      useCrudPageState("panel", nav),
    );
    expect(result.current.state.view).toBe("new");
    expect(result.current.state.selectedId).toBeNull();
  });

  it("provides fade transition result", () => {
    const nav = createNav("detail", "42");
    const { result } = renderHook(() =>
      useCrudPageState("panel", nav),
    );
    expect(result.current.fade).toBeDefined();
  });
});
