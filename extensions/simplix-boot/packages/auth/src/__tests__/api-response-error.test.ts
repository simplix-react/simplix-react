import { describe, expect, it } from "vitest";

import { ApiResponseError } from "../api-response-error.js";

describe("ApiResponseError", () => {
  it("creates an error with required fields", () => {
    const error = new ApiResponseError(
      400,
      "ERROR",
      "Bad Request",
      "2024-01-01T00:00:00Z",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiResponseError);
    expect(error.name).toBe("ApiResponseError");
    expect(error.message).toBe("Bad Request");
    expect(error.status).toBe(400);
    expect(error.type).toBe("ERROR");
    expect(error.errorMessage).toBe("Bad Request");
    expect(error.timestamp).toBe("2024-01-01T00:00:00Z");
    expect(error.errorCode).toBeUndefined();
    expect(error.errorDetail).toBeUndefined();
  });

  it("creates an error with optional errorCode", () => {
    const error = new ApiResponseError(
      422,
      "VALIDATION_ERROR",
      "Validation failed",
      "2024-01-01T00:00:00Z",
      "FIELD_INVALID",
    );

    expect(error.errorCode).toBe("FIELD_INVALID");
  });

  it("creates an error with array errorDetail", () => {
    const details = [
      { field: "name", message: "Name is required" },
      { field: "email", message: "Invalid email" },
    ];
    const error = new ApiResponseError(
      422,
      "VALIDATION_ERROR",
      "Validation failed",
      "2024-01-01T00:00:00Z",
      "FIELD_INVALID",
      details,
    );

    expect(error.errorDetail).toEqual(details);
  });

  it("creates an error with record errorDetail", () => {
    const details = { reason: "duplicate", entity: "Pet" };
    const error = new ApiResponseError(
      409,
      "CONFLICT",
      "Duplicate entity",
      "2024-01-01T00:00:00Z",
      "DUPLICATE",
      details,
    );

    expect(error.errorDetail).toEqual(details);
  });

  it("inherits from Error prototype", () => {
    const error = new ApiResponseError(500, "ERROR", "Internal error", "2024-01-01T00:00:00Z");

    expect(error.stack).toBeDefined();
  });
});
