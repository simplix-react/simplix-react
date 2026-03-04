import { describe, it, expect, vi } from "vitest";
import type { AnyFormApi } from "@tanstack/react-form";
import { mapServerErrorsToForm } from "../utils/server-error-mapping.js";

function createMockForm() {
  return {
    setFieldMeta: vi.fn(),
  } as unknown as AnyFormApi & { setFieldMeta: ReturnType<typeof vi.fn> };
}

describe("mapServerErrorsToForm", () => {
  // ── Non-validation errors (returns false) ──

  it("returns false for non-object error", () => {
    const form = createMockForm();
    expect(mapServerErrorsToForm("string error", form)).toBe(false);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });

  it("returns false for generic Error without validation data", () => {
    const form = createMockForm();
    expect(mapServerErrorsToForm(new Error("generic"), form)).toBe(false);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });

  it("returns false for error with empty errorDetail array", () => {
    const form = createMockForm();
    expect(mapServerErrorsToForm({ errorDetail: [] }, form)).toBe(false);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });

  it("returns false for error with invalid errorDetail format", () => {
    const form = createMockForm();
    expect(
      mapServerErrorsToForm({ errorDetail: [{ wrong: "format" }] }, form),
    ).toBe(false);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });

  it("returns false for unparseable body string", () => {
    const form = createMockForm();
    expect(mapServerErrorsToForm({ body: "not json{{" }, form)).toBe(false);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });

  // ── Spring Boot / ApiResponseError shape (error.errorDetail) ──

  it("maps Spring Boot errorDetail array to form fields", () => {
    const form = createMockForm();
    const error = {
      status: 400,
      errorDetail: [
        { field: "email", message: "is invalid" },
        { field: "name", message: "is required" },
      ],
    };
    expect(mapServerErrorsToForm(error, form)).toBe(true);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(2);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "email",
      expect.any(Function),
    );
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "name",
      expect.any(Function),
    );

    const emailUpdater = form.setFieldMeta.mock.calls.find(
      (c: unknown[]) => c[0] === "email",
    )![1] as (meta: Record<string, unknown>) => Record<string, unknown>;
    expect(emailUpdater({ errorMap: {} }).errorMap).toEqual({
      onSubmit: "is invalid",
    });
  });

  // ── HttpError shape (error.data.errorDetail) ──

  it("maps HttpError data.errorDetail to form fields", () => {
    const form = createMockForm();
    const error = {
      status: 400,
      data: {
        errorDetail: [{ field: "age", message: "must be positive" }],
      },
    };
    expect(mapServerErrorsToForm(error, form)).toBe(true);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(1);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "age",
      expect.any(Function),
    );
  });

  // ── Rails format (error.data.errors or body.errors) ──

  it("maps Rails format errors from error.data", () => {
    const form = createMockForm();
    const error = {
      status: 422,
      data: {
        errors: {
          email: ["is invalid"],
          name: ["is too short", "is required"],
        },
      },
    };
    expect(mapServerErrorsToForm(error, form)).toBe(true);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(2);

    const nameCall = form.setFieldMeta.mock.calls.find(
      (c: unknown[]) => c[0] === "name",
    )!;
    const nameUpdater = nameCall[1] as (
      meta: Record<string, unknown>,
    ) => Record<string, unknown>;
    expect(nameUpdater({ errorMap: {} }).errorMap).toEqual({
      onSubmit: "is too short, is required",
    });
  });

  it("maps Rails format errors from JSON.parse(error.body)", () => {
    const form = createMockForm();
    const error = {
      status: 422,
      body: JSON.stringify({
        errors: { email: ["is invalid"] },
      }),
    };
    expect(mapServerErrorsToForm(error, form)).toBe(true);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(1);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "email",
      expect.any(Function),
    );

    const updater = form.setFieldMeta.mock.calls[0][1] as (
      meta: Record<string, unknown>,
    ) => Record<string, unknown>;
    expect(updater({ errorMap: {} }).errorMap).toEqual({
      onSubmit: "is invalid",
    });
  });

  // ── JSON:API format (error.body or error.data) ──

  it("maps JSON:API format errors from body string", () => {
    const form = createMockForm();
    const error = {
      status: 422,
      body: JSON.stringify({
        errors: [{ field: "name", message: "required" }],
      }),
    };
    expect(mapServerErrorsToForm(error, form)).toBe(true);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(1);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "name",
      expect.any(Function),
    );

    const updater = form.setFieldMeta.mock.calls[0][1] as (
      meta: Record<string, unknown>,
    ) => Record<string, unknown>;
    expect(updater({ errorMap: {} }).errorMap).toEqual({
      onSubmit: "required",
    });
  });

  // ── body string with errorDetail (Spring Boot via ApiError) ──

  it("maps errorDetail from JSON.parse(error.body)", () => {
    const form = createMockForm();
    const error = {
      body: JSON.stringify({
        errorDetail: [{ field: "title", message: "too long" }],
      }),
    };
    expect(mapServerErrorsToForm(error, form)).toBe(true);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(1);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "title",
      expect.any(Function),
    );
  });

  // ── Multiple errors on same field are grouped ──

  it("groups multiple errors per field", () => {
    const form = createMockForm();
    const error = {
      errorDetail: [
        { field: "name", message: "too short" },
        { field: "name", message: "must start with letter" },
        { field: "email", message: "invalid" },
      ],
    };
    expect(mapServerErrorsToForm(error, form)).toBe(true);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(2);

    const nameCall = form.setFieldMeta.mock.calls.find(
      (c: unknown[]) => c[0] === "name",
    )!;
    const nameUpdater = nameCall[1] as (
      meta: Record<string, unknown>,
    ) => Record<string, unknown>;
    expect(nameUpdater({ errorMap: {} }).errorMap).toEqual({
      onSubmit: "too short, must start with letter",
    });
  });

  // ── Direct errors array on error object (no data wrapper) ──

  it("maps direct errors array on error object", () => {
    const form = createMockForm();
    const error = {
      status: 422,
      errors: [{ field: "name", message: "required" }],
    };
    expect(mapServerErrorsToForm(error, form)).toBe(true);
    expect(form.setFieldMeta).toHaveBeenCalledTimes(1);
    expect(form.setFieldMeta).toHaveBeenCalledWith(
      "name",
      expect.any(Function),
    );
  });

  // ── Empty Rails errors object returns false ──

  it("returns false for empty Rails errors object", () => {
    const form = createMockForm();
    expect(
      mapServerErrorsToForm({ data: { errors: {} } }, form),
    ).toBe(false);
    expect(form.setFieldMeta).not.toHaveBeenCalled();
  });
});
