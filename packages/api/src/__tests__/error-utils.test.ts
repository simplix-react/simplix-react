import { describe, expect, it } from "vitest";

import {
  HttpError,
  getValidationErrors,
  getErrorMessage,
  getErrorCode,
  getHttpStatus,
  classifyError,
  createMutationErrorHandler,
} from "../index.js";

describe("getValidationErrors", () => {
  it("extracts from error.errorDetail (ApiResponseError shape)", () => {
    const error = {
      errorDetail: [
        { field: "name", message: "required" },
        { field: "email", message: "invalid format" },
      ],
    };
    expect(getValidationErrors(error)).toEqual([
      { field: "name", message: "required" },
      { field: "email", message: "invalid format" },
    ]);
  });

  it("extracts from direct error.errors array (no data wrapper)", () => {
    const error = {
      status: 422,
      errors: [
        { field: "name", message: "required" },
        { field: "email", message: "invalid" },
      ],
    };
    expect(getValidationErrors(error)).toEqual([
      { field: "name", message: "required" },
      { field: "email", message: "invalid" },
    ]);
  });

  it("extracts from error.data.errorDetail (HttpError shape)", () => {
    const error = new HttpError(400, "Bad Request", {
      errorDetail: [{ field: "age", message: "must be positive" }],
    });
    expect(getValidationErrors(error)).toEqual([
      { field: "age", message: "must be positive" },
    ]);
  });

  it("extracts from error.data.errors (Rails shape)", () => {
    const error = new HttpError(422, "Unprocessable", {
      errors: {
        name: ["can't be blank", "is too short"],
        email: ["is invalid"],
      },
    });
    const result = getValidationErrors(error);
    expect(result).toEqual([
      { field: "name", message: "can't be blank" },
      { field: "name", message: "is too short" },
      { field: "email", message: "is invalid" },
    ]);
  });

  it("extracts from error.data.errors (JSON:API shape)", () => {
    const error = new HttpError(422, "Unprocessable", {
      errors: [
        { field: "name", message: "required" },
        { field: "email", message: "invalid format" },
      ],
    });
    expect(getValidationErrors(error)).toEqual([
      { field: "name", message: "required" },
      { field: "email", message: "invalid format" },
    ]);
  });

  it("extracts from JSON.parse(error.body) with errorDetail", () => {
    const error = {
      body: JSON.stringify({
        errorDetail: [{ field: "title", message: "too long" }],
      }),
    };
    expect(getValidationErrors(error)).toEqual([
      { field: "title", message: "too long" },
    ]);
  });

  it("extracts from JSON.parse(error.body) with Rails errors", () => {
    const error = {
      body: JSON.stringify({
        errors: { password: ["too short"] },
      }),
    };
    expect(getValidationErrors(error)).toEqual([
      { field: "password", message: "too short" },
    ]);
  });

  it("returns null for null/undefined error", () => {
    expect(getValidationErrors(null)).toBeNull();
    expect(getValidationErrors(undefined)).toBeNull();
  });

  it("returns null for error without validation data", () => {
    expect(getValidationErrors(new Error("generic"))).toBeNull();
  });

  it("returns null for empty errorDetail array", () => {
    expect(getValidationErrors({ errorDetail: [] })).toBeNull();
  });

  it("returns null for invalid errorDetail format", () => {
    expect(
      getValidationErrors({ errorDetail: [{ wrong: "format" }] }),
    ).toBeNull();
  });

  it("returns null for invalid body JSON", () => {
    expect(getValidationErrors({ body: "not json{" })).toBeNull();
  });

  it("returns null for empty Rails errors object", () => {
    const error = new HttpError(422, "Unprocessable", { errors: {} });
    expect(getValidationErrors(error)).toBeNull();
  });
});

describe("getErrorMessage", () => {
  it("returns message from Error instance", () => {
    expect(getErrorMessage(new Error("test message"))).toBe("test message");
  });

  it("returns message from HttpError", () => {
    expect(getErrorMessage(new HttpError(400, "bad request"))).toBe(
      "bad request",
    );
  });

  it("returns string directly", () => {
    expect(getErrorMessage("string error")).toBe("string error");
  });

  it("returns default for non-string/non-Error", () => {
    expect(getErrorMessage(42)).toBe("An unknown error occurred");
    expect(getErrorMessage(null)).toBe("An unknown error occurred");
  });
});

describe("getErrorCode", () => {
  it("extracts from error.errorCode", () => {
    expect(getErrorCode({ errorCode: "VALIDATION_FAILED" })).toBe(
      "VALIDATION_FAILED",
    );
  });

  it("extracts from error.data.errorCode (HttpError)", () => {
    const error = new HttpError(400, "Bad", { errorCode: "INVALID_INPUT" });
    expect(getErrorCode(error)).toBe("INVALID_INPUT");
  });

  it("returns null for no errorCode", () => {
    expect(getErrorCode(new Error("test"))).toBeNull();
  });

  it("returns null for non-object", () => {
    expect(getErrorCode(null)).toBeNull();
    expect(getErrorCode("str")).toBeNull();
  });
});

describe("getHttpStatus", () => {
  it("extracts from HttpError instance", () => {
    expect(getHttpStatus(new HttpError(404, "Not Found"))).toBe(404);
  });

  it("extracts from object with status property", () => {
    expect(getHttpStatus({ status: 500 })).toBe(500);
  });

  it("returns null for TypeError (no status)", () => {
    expect(getHttpStatus(new TypeError("Failed to fetch"))).toBeNull();
  });

  it("returns null for non-object", () => {
    expect(getHttpStatus(null)).toBeNull();
    expect(getHttpStatus("error")).toBeNull();
  });
});

describe("classifyError", () => {
  it("classifies network error (TypeError without status)", () => {
    const result = classifyError(new TypeError("Failed to fetch"));
    expect(result.category).toBe("network");
    expect(result.status).toBeUndefined();
  });

  it("classifies auth error (401) without validationErrors", () => {
    const result = classifyError(new HttpError(401, "Unauthorized"));
    expect(result.category).toBe("auth");
    expect(result.status).toBe(401);
    expect(result.validationErrors).toBeUndefined();
  });

  it("classifies auth error (403)", () => {
    const result = classifyError(new HttpError(403, "Forbidden"));
    expect(result.category).toBe("auth");
    expect(result.status).toBe(403);
  });

  it("classifies server error (500+)", () => {
    const result = classifyError(new HttpError(502, "Bad Gateway"));
    expect(result.category).toBe("server");
    expect(result.status).toBe(502);
  });

  it("classifies validation error (400-499 with validation errors)", () => {
    const error = new HttpError(422, "Unprocessable", {
      errorDetail: [{ field: "name", message: "required" }],
    });
    const result = classifyError(error);
    expect(result.category).toBe("validation");
    expect(result.status).toBe(422);
    expect(result.validationErrors).toEqual([
      { field: "name", message: "required" },
    ]);
  });

  it("classifies client error (400-499 without validation errors)", () => {
    const result = classifyError(new HttpError(404, "Not Found"));
    expect(result.category).toBe("client");
    expect(result.status).toBe(404);
  });

  it("classifies unknown error", () => {
    const result = classifyError(new Error("something went wrong"));
    expect(result.category).toBe("unknown");
    expect(result.status).toBeUndefined();
  });

  it("includes errorCode when present", () => {
    const error = new HttpError(400, "Bad", { errorCode: "ERR_001" });
    const result = classifyError(error);
    expect(result.errorCode).toBe("ERR_001");
  });
});

describe("createMutationErrorHandler", () => {
  it("calls onValidationError for validation errors", () => {
    const calls: string[] = [];
    const handler = createMutationErrorHandler({
      onValidationError: () => calls.push("validation"),
      onClientError: () => calls.push("client"),
    });

    const error = new HttpError(422, "Unprocessable", {
      errorDetail: [{ field: "name", message: "required" }],
    });
    handler(error);
    expect(calls).toEqual(["validation"]);
  });

  it("calls onAuthError for 401", () => {
    const calls: string[] = [];
    const handler = createMutationErrorHandler({
      onAuthError: () => calls.push("auth"),
    });

    handler(new HttpError(401, "Unauthorized"));
    expect(calls).toEqual(["auth"]);
  });

  it("calls onServerError for 500+", () => {
    const calls: string[] = [];
    const handler = createMutationErrorHandler({
      onServerError: () => calls.push("server"),
    });

    handler(new HttpError(500, "Internal Server Error"));
    expect(calls).toEqual(["server"]);
  });

  it("calls onNetworkError for TypeError", () => {
    const calls: string[] = [];
    const handler = createMutationErrorHandler({
      onNetworkError: () => calls.push("network"),
    });

    handler(new TypeError("Failed to fetch"));
    expect(calls).toEqual(["network"]);
  });

  it("calls onClientError for 404", () => {
    const calls: string[] = [];
    const handler = createMutationErrorHandler({
      onClientError: () => calls.push("client"),
    });

    handler(new HttpError(404, "Not Found"));
    expect(calls).toEqual(["client"]);
  });

  it("calls onUnknownError for unclassified errors", () => {
    const calls: string[] = [];
    const handler = createMutationErrorHandler({
      onUnknownError: () => calls.push("unknown"),
    });

    handler(new Error("random"));
    expect(calls).toEqual(["unknown"]);
  });

  it("does nothing for unknown category when no handler", () => {
    const handler = createMutationErrorHandler({});
    // Should not throw
    handler(new Error("random"));
  });
});
