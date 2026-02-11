import { describe, it, expect, vi } from "vitest";
import type { AnyFormApi } from "@tanstack/react-form";
import { ApiError } from "@simplix-react/contract";
import { mapServerErrorsToForm } from "../utils/server-error-mapping.js";

function createMockForm() {
  return {
    setFieldMeta: vi.fn(),
  } as unknown as AnyFormApi & { setFieldMeta: ReturnType<typeof vi.fn> };
}

describe("mapServerErrorsToForm", () => {
  it("does nothing for non-ApiError", () => {
    const form = createMockForm();
    mapServerErrorsToForm(new Error("generic"), form);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });

  it("does nothing for ApiError with non-422 status", () => {
    const form = createMockForm();
    mapServerErrorsToForm(new ApiError(500, "server error"), form);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });

  it("does nothing for ApiError 422 with unparseable body", () => {
    const form = createMockForm();
    mapServerErrorsToForm(new ApiError(422, "not json{{{"), form);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });

  it("maps Rails format errors to form fields", () => {
    const form = createMockForm();
    const body = JSON.stringify({
      errors: { email: ["is invalid"] },
    });
    mapServerErrorsToForm(new ApiError(422, body), form);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(1);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "email",
      expect.any(Function),
    );

    // Verify the updater function sets errorMap correctly
    const updater = form.setFieldMeta.mock.calls[0][1] as (
      meta: Record<string, unknown>,
    ) => Record<string, unknown>;
    const result = updater({ errorMap: {} });
    expect(result.errorMap).toEqual({ onSubmit: "is invalid" });
  });

  it("maps JSON:API format errors to form fields", () => {
    const form = createMockForm();
    const body = JSON.stringify({
      errors: [{ field: "name", message: "required" }],
    });
    mapServerErrorsToForm(new ApiError(422, body), form);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(1);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "name",
      expect.any(Function),
    );

    const updater = form.setFieldMeta.mock.calls[0][1] as (
      meta: Record<string, unknown>,
    ) => Record<string, unknown>;
    const result = updater({ errorMap: {} });
    expect(result.errorMap).toEqual({ onSubmit: "required" });
  });

  it("maps multiple fields from Rails format", () => {
    const form = createMockForm();
    const body = JSON.stringify({
      errors: {
        email: ["is invalid"],
        name: ["is too short", "is required"],
      },
    });
    mapServerErrorsToForm(new ApiError(422, body), form);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(2);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "email",
      expect.any(Function),
    );
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "name",
      expect.any(Function),
    );

    // Verify multiple messages are joined
    const nameCall = form.setFieldMeta.mock.calls.find(
      (c: unknown[]) => c[0] === "name",
    )!;
    const nameUpdater = nameCall[1] as (
      meta: Record<string, unknown>,
    ) => Record<string, unknown>;
    const nameResult = nameUpdater({ errorMap: {} });
    expect(nameResult.errorMap).toEqual({
      onSubmit: "is too short, is required",
    });
  });
});
