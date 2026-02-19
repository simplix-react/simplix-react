// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { usePreviousData } from "../../crud/detail/use-previous-data";

describe("usePreviousData", () => {
  it("returns data when provided", () => {
    const data = { id: 1, name: "Alice" };
    const { result } = renderHook(() => usePreviousData(data));

    expect(result.current).toEqual(data);
  });

  it("returns undefined when initially null", () => {
    const { result } = renderHook(() => usePreviousData(null));

    expect(result.current).toBeUndefined();
  });

  it("returns undefined when initially undefined", () => {
    const { result } = renderHook(() => usePreviousData(undefined));

    expect(result.current).toBeUndefined();
  });

  it("retains previous data when new value is null", () => {
    const data = { id: 1, name: "Alice" };
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousData(value),
      { initialProps: { value: data as typeof data | null } },
    );

    expect(result.current).toEqual(data);

    rerender({ value: null });

    expect(result.current).toEqual(data);
  });

  it("retains previous data when new value is undefined", () => {
    const data = { id: 2, name: "Bob" };
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousData(value),
      { initialProps: { value: data as typeof data | undefined } },
    );

    expect(result.current).toEqual(data);

    rerender({ value: undefined });

    expect(result.current).toEqual(data);
  });

  it("updates to new data when non-nullish value is provided", () => {
    const first = { id: 1, name: "Alice" };
    const second = { id: 2, name: "Bob" };
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousData(value),
      { initialProps: { value: first as typeof first | null } },
    );

    expect(result.current).toEqual(first);

    rerender({ value: second });

    expect(result.current).toEqual(second);
  });

  it("retains last non-nullish value across multiple null transitions", () => {
    const data = { id: 3, name: "Charlie" };
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousData(value),
      { initialProps: { value: data as typeof data | null | undefined } },
    );

    rerender({ value: null });
    expect(result.current).toEqual(data);

    rerender({ value: undefined });
    expect(result.current).toEqual(data);

    rerender({ value: null });
    expect(result.current).toEqual(data);
  });

  it("works with primitive values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousData(value),
      { initialProps: { value: 42 as number | null } },
    );

    expect(result.current).toBe(42);

    rerender({ value: null });
    expect(result.current).toBe(42);

    rerender({ value: 99 });
    expect(result.current).toBe(99);
  });
});
