// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useCrudDeleteList, useCrudDeleteDetail } from "../../crud/delete/use-crud-delete";

describe("useCrudDeleteList", () => {
  it("initializes with closed state and no target", () => {
    const { result } = renderHook(() => useCrudDeleteList());

    expect(result.current.open).toBe(false);
    expect(result.current.target).toBeNull();
  });

  it("opens with target when requestDelete is called", () => {
    const { result } = renderHook(() => useCrudDeleteList());
    const target = { id: "1", name: "Item 1" };

    act(() => result.current.requestDelete(target));

    expect(result.current.open).toBe(true);
    expect(result.current.target).toEqual(target);
  });

  it("closes and clears target on cancel", () => {
    const { result } = renderHook(() => useCrudDeleteList());

    act(() => result.current.requestDelete({ id: "1", name: "Item 1" }));
    expect(result.current.open).toBe(true);

    act(() => result.current.cancel());
    expect(result.current.open).toBe(false);
    expect(result.current.target).toBeNull();
  });

  it("replaces target when requestDelete is called again", () => {
    const { result } = renderHook(() => useCrudDeleteList());

    act(() => result.current.requestDelete({ id: "1", name: "First" }));
    act(() => result.current.requestDelete({ id: "2", name: "Second" }));

    expect(result.current.target).toEqual({ id: "2", name: "Second" });
  });

  it("handles numeric id", () => {
    const { result } = renderHook(() => useCrudDeleteList());

    act(() => result.current.requestDelete({ id: 42, name: "Numeric" }));
    expect(result.current.target?.id).toBe(42);
  });
});

describe("useCrudDeleteDetail", () => {
  it("initializes with closed state", () => {
    const { result } = renderHook(() => useCrudDeleteDetail());

    expect(result.current.open).toBe(false);
  });

  it("opens on requestDelete", () => {
    const { result } = renderHook(() => useCrudDeleteDetail());

    act(() => result.current.requestDelete());
    expect(result.current.open).toBe(true);
  });

  it("closes on cancel", () => {
    const { result } = renderHook(() => useCrudDeleteDetail());

    act(() => result.current.requestDelete());
    act(() => result.current.cancel());
    expect(result.current.open).toBe(false);
  });

  it("onOpenChange(false) closes the dialog", () => {
    const { result } = renderHook(() => useCrudDeleteDetail());

    act(() => result.current.requestDelete());
    expect(result.current.open).toBe(true);

    act(() => result.current.onOpenChange(false));
    expect(result.current.open).toBe(false);
  });

  it("onOpenChange(true) opens the dialog", () => {
    const { result } = renderHook(() => useCrudDeleteDetail());

    act(() => result.current.onOpenChange(true));
    expect(result.current.open).toBe(true);
  });
});
