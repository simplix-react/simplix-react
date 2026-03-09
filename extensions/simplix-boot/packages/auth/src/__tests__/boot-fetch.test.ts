import { describe, expect, it } from "vitest";

import { ApiResponseError } from "../api-response-error.js";
import { bootResponseAdapter } from "../boot-fetch.js";

describe("bootResponseAdapter", () => {
  describe("toError", () => {
    it("creates ApiResponseError from Boot envelope error", () => {
      const body = {
        type: "VALIDATION_ERROR",
        message: "Validation failed",
        body: null,
        timestamp: "2024-01-01T00:00:00Z",
        errorCode: "FIELD_INVALID",
        errorDetail: [{ field: "name", message: "Required" }],
      };

      const error = bootResponseAdapter.toError(body, 422);

      expect(error).toBeInstanceOf(ApiResponseError);
      const apiError = error as ApiResponseError;
      expect(apiError.status).toBe(422);
      expect(apiError.type).toBe("VALIDATION_ERROR");
      expect(apiError.errorMessage).toBe("Validation failed");
      expect(apiError.timestamp).toBe("2024-01-01T00:00:00Z");
      expect(apiError.errorCode).toBe("FIELD_INVALID");
      expect(apiError.errorDetail).toEqual([{ field: "name", message: "Required" }]);
    });

    it("creates generic ApiResponseError for non-Boot response", () => {
      const body = { detail: "Not found" };
      const error = bootResponseAdapter.toError(body, 404);

      expect(error).toBeInstanceOf(ApiResponseError);
      const apiError = error as ApiResponseError;
      expect(apiError.status).toBe(404);
      expect(apiError.type).toBe("ERROR");
      expect(apiError.errorMessage).toBe("HTTP 404");
    });

    it("creates generic ApiResponseError for null body", () => {
      const error = bootResponseAdapter.toError(null, 500);

      expect(error).toBeInstanceOf(ApiResponseError);
      const apiError = error as ApiResponseError;
      expect(apiError.status).toBe(500);
      expect(apiError.type).toBe("ERROR");
      expect(apiError.errorMessage).toBe("HTTP 500");
    });

    it("creates generic ApiResponseError for string body", () => {
      const error = bootResponseAdapter.toError("Internal Server Error", 500);

      expect(error).toBeInstanceOf(ApiResponseError);
      const apiError = error as ApiResponseError;
      expect(apiError.status).toBe(500);
      expect(apiError.type).toBe("ERROR");
    });

    it("handles Boot envelope with null errorCode and errorDetail", () => {
      const body = {
        type: "ERROR",
        message: "Something went wrong",
        body: null,
        timestamp: "2024-01-01T00:00:00Z",
        errorCode: null,
        errorDetail: null,
      };

      const error = bootResponseAdapter.toError(body, 500);
      const apiError = error as ApiResponseError;
      expect(apiError.errorCode).toBeUndefined();
      expect(apiError.errorDetail).toBeUndefined();
    });
  });
});
