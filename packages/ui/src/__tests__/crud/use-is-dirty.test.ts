// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useIsDirty } from "../../crud/form/use-is-dirty";

describe("useIsDirty", () => {
  it("returns false when current equals initial", () => {
    const values = { name: "Alice", age: 30 };
    const { result } = renderHook(() => useIsDirty(values, values));
    expect(result.current).toBe(false);
  });

  it("returns false when values are shallowly equal", () => {
    const current = { name: "Alice", age: 30 };
    const initial = { name: "Alice", age: 30 };
    const { result } = renderHook(() => useIsDirty(current, initial));
    expect(result.current).toBe(false);
  });

  it("returns true when a value differs", () => {
    const current = { name: "Bob", age: 30 };
    const initial = { name: "Alice", age: 30 };
    const { result } = renderHook(() => useIsDirty(current, initial));
    expect(result.current).toBe(true);
  });

  it("returns true when multiple values differ", () => {
    const current = { name: "Bob", age: 25 };
    const initial = { name: "Alice", age: 30 };
    const { result } = renderHook(() => useIsDirty(current, initial));
    expect(result.current).toBe(true);
  });

  it("detects change from undefined to defined", () => {
    const current = { name: "Alice" as string | undefined };
    const initial = { name: undefined as string | undefined };
    const { result } = renderHook(() => useIsDirty(current, initial));
    expect(result.current).toBe(true);
  });

  it("does not deep-compare objects (shallow only)", () => {
    const obj = { x: 1 };
    const current = { data: obj };
    const initial = { data: { x: 1 } }; // different reference, same shape
    const { result } = renderHook(() => useIsDirty(current, initial));
    // Shallow comparison: different references → dirty
    expect(result.current).toBe(true);
  });

  it("returns false for empty objects", () => {
    const { result } = renderHook(() => useIsDirty({}, {}));
    expect(result.current).toBe(false);
  });
});
