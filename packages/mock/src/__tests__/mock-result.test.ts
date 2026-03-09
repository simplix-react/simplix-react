import { describe, it, expect } from "vitest";
import { mockSuccess, mockFailure } from "../mock-result.js";
import type { MockResult } from "../mock-result.js";

describe("mockSuccess", () => {
  it("returns success: true with data", () => {
    const result = mockSuccess({ id: "1", title: "Test" });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "1", title: "Test" });
  });

  it("has no error property", () => {
    const result = mockSuccess("value");

    expect(result.error).toBeUndefined();
  });

  it("works with primitive data", () => {
    const result = mockSuccess(42);

    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
  });

  it("works with null data", () => {
    const result = mockSuccess(null);

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it("works with array data", () => {
    const result = mockSuccess([1, 2, 3]);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([1, 2, 3]);
  });

  it("conforms to MockResult<T> type", () => {
    const result: MockResult<{ id: string }> = mockSuccess({ id: "1" });

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("1");
  });
});

describe("mockFailure", () => {
  it("returns success: false with error", () => {
    const result = mockFailure({ code: "not_found", message: "Task not found" });

    expect(result.success).toBe(false);
    expect(result.error).toEqual({ code: "not_found", message: "Task not found" });
  });

  it("has no data property", () => {
    const result = mockFailure({ code: "err", message: "fail" });

    expect(result.data).toBeUndefined();
  });

  it("preserves error code and message", () => {
    const result = mockFailure({ code: "validation_error", message: "Name is required" });

    expect(result.error!.code).toBe("validation_error");
    expect(result.error!.message).toBe("Name is required");
  });

  it("conforms to MockResult<never> type", () => {
    const result: MockResult<never> = mockFailure({ code: "forbidden", message: "Access denied" });

    expect(result.success).toBe(false);
  });

  it("can be assigned to any MockResult<T>", () => {
    const result: MockResult<{ id: string }> = mockFailure({ code: "err", message: "fail" });

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
  });
});
