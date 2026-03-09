import { describe, expect, it } from "vitest";

import { bootSchemaAdapter } from "../schema-adapter.js";

describe("bootSchemaAdapter", () => {
  describe("id", () => {
    it("has id 'boot'", () => {
      expect(bootSchemaAdapter.id).toBe("boot");
    });
  });

  describe("canUnwrap", () => {
    it("returns true for valid Boot envelope schema", () => {
      const schema = {
        properties: {
          type: { type: "string" },
          message: { type: "string" },
          body: {
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "number" },
            },
          },
          timestamp: { type: "string" },
        },
      };
      expect(bootSchemaAdapter.canUnwrap(schema)).toBe(true);
    });

    it("returns false when properties is missing", () => {
      const schema = {};
      expect(bootSchemaAdapter.canUnwrap(schema)).toBe(false);
    });

    it("returns false when type is not string type", () => {
      const schema = {
        properties: {
          type: { type: "number" },
          message: { type: "string" },
          body: { type: "object", properties: { name: { type: "string" } } },
        },
      };
      expect(bootSchemaAdapter.canUnwrap(schema)).toBe(false);
    });

    it("returns false when message is not string type", () => {
      const schema = {
        properties: {
          type: { type: "string" },
          message: { type: "number" },
          body: { type: "object", properties: { name: { type: "string" } } },
        },
      };
      expect(bootSchemaAdapter.canUnwrap(schema)).toBe(false);
    });

    it("returns false when body is not object type", () => {
      const schema = {
        properties: {
          type: { type: "string" },
          message: { type: "string" },
          body: { type: "string" },
        },
      };
      expect(bootSchemaAdapter.canUnwrap(schema)).toBe(false);
    });

    it("returns false when body has no properties", () => {
      const schema = {
        properties: {
          type: { type: "string" },
          message: { type: "string" },
          body: { type: "object" },
        },
      };
      expect(bootSchemaAdapter.canUnwrap(schema)).toBe(false);
    });

    it("returns false when body properties are empty", () => {
      const schema = {
        properties: {
          type: { type: "string" },
          message: { type: "string" },
          body: { type: "object", properties: {} },
        },
      };
      expect(bootSchemaAdapter.canUnwrap(schema)).toBe(false);
    });
  });

  describe("unwrap", () => {
    it("extracts the body sub-schema", () => {
      const bodySchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          id: { type: "number" },
        },
      };
      const schema = {
        properties: {
          type: { type: "string" },
          message: { type: "string" },
          body: bodySchema,
          timestamp: { type: "string" },
        },
      };
      expect(bootSchemaAdapter.unwrap(schema)).toBe(bodySchema);
    });
  });

  describe("stripPrefix", () => {
    it("strips SimpliXApiResponse prefix", () => {
      expect(bootSchemaAdapter.stripPrefix!("SimpliXApiResponsePet")).toBe("Pet");
    });

    it("strips prefix from multi-word type names", () => {
      expect(bootSchemaAdapter.stripPrefix!("SimpliXApiResponseAccessPoint")).toBe("AccessPoint");
    });

    it("returns unchanged name without prefix", () => {
      expect(bootSchemaAdapter.stripPrefix!("Pet")).toBe("Pet");
    });

    it("returns empty string when name equals prefix exactly", () => {
      expect(bootSchemaAdapter.stripPrefix!("SimpliXApiResponse")).toBe("");
    });
  });
});
