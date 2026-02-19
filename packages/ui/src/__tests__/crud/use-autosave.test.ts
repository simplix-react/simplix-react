// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useAutosave } from "../../crud/form/use-autosave";

describe("useAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with idle status and no lastSavedAt", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useAutosave({ values: { a: 1 }, onSave }),
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSavedAt).toBeNull();
  });

  it("does not trigger save on first render", () => {
    const onSave = vi.fn();
    renderHook(() => useAutosave({ values: { a: 1 }, onSave }));

    vi.advanceTimersByTime(3000);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("triggers save after debounce when values change", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ values }) => useAutosave({ values, onSave, debounceMs: 500 }),
      { initialProps: { values: { a: 1 } } },
    );

    rerender({ values: { a: 2 } });
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(onSave).toHaveBeenCalledWith({ a: 2 });
  });

  it("sets status to 'saved' after successful save", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ values }) => useAutosave({ values, onSave, debounceMs: 100 }),
      { initialProps: { values: { x: "a" } } },
    );

    rerender({ values: { x: "b" } });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.status).toBe("saved");
    expect(result.current.lastSavedAt).toBeInstanceOf(Date);
  });

  it("sets status to 'error' when save fails", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("fail"));
    const { result, rerender } = renderHook(
      ({ values }) => useAutosave({ values, onSave, debounceMs: 100 }),
      { initialProps: { values: { x: 1 } } },
    );

    rerender({ values: { x: 2 } });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.lastSavedAt).toBeNull();
  });

  it("does not save when enabled is false", () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ values }) => useAutosave({ values, onSave, enabled: false, debounceMs: 100 }),
      { initialProps: { values: { a: 1 } } },
    );

    rerender({ values: { a: 2 } });
    vi.advanceTimersByTime(200);

    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not save when hasErrors is true", () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ values }) => useAutosave({ values, onSave, hasErrors: true, debounceMs: 100 }),
      { initialProps: { values: { a: 1 } } },
    );

    rerender({ values: { a: 2 } });
    vi.advanceTimersByTime(200);

    expect(onSave).not.toHaveBeenCalled();
  });

  it("debounces multiple rapid changes", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ values }) => useAutosave({ values, onSave, debounceMs: 300 }),
      { initialProps: { values: { a: 1 } } },
    );

    rerender({ values: { a: 2 } });
    vi.advanceTimersByTime(100);

    rerender({ values: { a: 3 } });
    vi.advanceTimersByTime(100);

    rerender({ values: { a: 4 } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Only the last value should be saved
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ a: 4 });
  });

  it("uses default debounceMs of 2000", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ values }) => useAutosave({ values, onSave }),
      { initialProps: { values: { a: 1 } } },
    );

    rerender({ values: { a: 2 } });
    vi.advanceTimersByTime(1999);
    expect(onSave).not.toHaveBeenCalled();
  });
});
