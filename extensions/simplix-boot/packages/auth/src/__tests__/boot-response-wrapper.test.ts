import { describe, expect, it } from "vitest";

import { bootResponseWrapper } from "../mock/boot-response-wrapper.js";

describe("bootResponseWrapper", () => {
  describe("success", () => {
    it("wraps data in Boot envelope format", () => {
      const data = { id: 1, name: "Buddy" };
      const result = bootResponseWrapper.success(data);

      expect(result.type).toBe("SUCCESS");
      expect(result.message).toBe("OK");
      expect(result.body).toEqual(data);
      expect(result.timestamp).toBeDefined();
      expect(result.errorCode).toBeNull();
      expect(result.errorDetail).toBeNull();
    });

    it("wraps null data", () => {
      const result = bootResponseWrapper.success(null);
      expect(result.body).toBeNull();
      expect(result.type).toBe("SUCCESS");
    });

    it("wraps array data", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = bootResponseWrapper.success(data);
      expect(result.body).toEqual(data);
    });
  });

  describe("error", () => {
    it("creates error envelope with message and code", () => {
      const error = { message: "Not found", code: "NOT_FOUND" };
      const result = bootResponseWrapper.error(error);

      expect(result.type).toBe("ERROR");
      expect(result.message).toBe("Not found");
      expect(result.body).toBeNull();
      expect(result.errorCode).toBe("NOT_FOUND");
      expect(result.errorDetail).toBeNull();
      expect(result.timestamp).toBeDefined();
    });

    it("uses default message for undefined error", () => {
      const result = bootResponseWrapper.error(undefined as never);

      expect(result.type).toBe("ERROR");
      expect(result.message).toBe("Error");
      expect(result.errorCode).toBe("UNKNOWN");
    });

    it("uses default code for error without code", () => {
      const error = { message: "Something failed" };
      const result = bootResponseWrapper.error(error);

      expect(result.errorCode).toBe("UNKNOWN");
    });
  });
});
