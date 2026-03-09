import { describe, it, expect } from "vitest";
import { resolveRefs } from "../openapi/pipeline/schema-resolver.js";
import type { OpenAPISpec } from "../openapi/types.js";

describe("resolveRefs (extended)", () => {
  it("resolves allOf by merging properties and required arrays", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "AllOf Test", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Combined" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Base: {
            type: "object",
            properties: { id: { type: "string" } },
            required: ["id"],
          },
          Extended: {
            type: "object",
            properties: { name: { type: "string" } },
            required: ["name"],
          },
          Combined: {
            allOf: [
              { $ref: "#/components/schemas/Base" },
              { $ref: "#/components/schemas/Extended" },
            ],
          },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const schema = resolved.paths["/items"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;

    expect(schema?.properties?.id?.type).toBe("string");
    expect(schema?.properties?.name?.type).toBe("string");
    expect(schema?.required).toContain("id");
    expect(schema?.required).toContain("name");
  });

  it("resolves oneOf using first schema", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "OneOf Test", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      oneOf: [
                        { type: "string" },
                        { type: "number" },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const schema = resolved.paths["/items"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;

    expect(schema?.type).toBe("string");
  });

  it("resolves anyOf using first schema", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "AnyOf Test", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      anyOf: [
                        { type: "boolean" },
                        { type: "integer" },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const schema = resolved.paths["/items"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;

    expect(schema?.type).toBe("boolean");
  });

  it("resolves nested properties recursively", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Nested Test", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Inner" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Inner: {
            type: "object",
            properties: {
              value: { type: "string" },
            },
          },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const schema = resolved.paths["/items"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;

    expect(schema?.properties?.data?.properties?.value?.type).toBe("string");
  });

  it("resolves array items $ref", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Array Test", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Item" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Item: {
            type: "object",
            properties: {
              id: { type: "integer" },
            },
          },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const schema = resolved.paths["/items"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;

    expect(schema?.items?.properties?.id?.type).toBe("integer");
  });

  it("handles circular $ref by keeping stub", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Circular Test", version: "1.0.0" },
      paths: {
        "/nodes": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Node" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Node: {
            type: "object",
            properties: {
              id: { type: "string" },
              children: {
                type: "array",
                items: { $ref: "#/components/schemas/Node" },
              },
            },
          },
        },
      },
    };

    // Should not throw due to circular ref
    const resolved = resolveRefs(spec);
    const schema = resolved.paths["/nodes"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;

    expect(schema?.properties?.id?.type).toBe("string");
    // Circular ref is kept as $ref stub
    expect(schema?.properties?.children?.items?.$ref).toBe("#/components/schemas/Node");
  });

  it("throws for unsupported $ref format", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Bad Ref", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "external.json#/Item" },
                  },
                },
              },
            },
          },
        },
      },
    };

    expect(() => resolveRefs(spec)).toThrow("Unsupported $ref format");
  });

  it("keeps $ref for missing schema", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Missing Ref", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Missing" },
                  },
                },
              },
            },
          },
        },
      },
      components: { schemas: {} },
    };

    const resolved = resolveRefs(spec);
    const schema = resolved.paths["/items"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;

    expect(schema?.$ref).toBe("#/components/schemas/Missing");
  });

  it("resolves request body schemas", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Body Test", version: "1.0.0" },
      paths: {
        "/items": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateItem" },
                },
              },
            },
            responses: { "201": {} },
          },
        },
      },
      components: {
        schemas: {
          CreateItem: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const bodySchema = resolved.paths["/items"]?.post?.requestBody?.content?.["application/json"]?.schema;

    expect(bodySchema?.properties?.name?.type).toBe("string");
    expect(bodySchema?.required).toContain("name");
  });

  it("resolves parameter schemas", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Param Test", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            parameters: [
              {
                name: "status",
                in: "query",
                schema: { $ref: "#/components/schemas/Status" },
              },
            ],
            responses: { "200": {} },
          },
        },
      },
      components: {
        schemas: {
          Status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const paramSchema = resolved.paths["/items"]?.get?.parameters?.[0]?.schema;

    expect(paramSchema?.type).toBe("string");
    expect(paramSchema?.enum).toEqual(["active", "inactive"]);
  });

  it("resolves path-level parameters", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Path Param Test", version: "1.0.0" },
      paths: {
        "/items/{id}": {
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { $ref: "#/components/schemas/ItemId" },
            },
          ],
          get: {
            responses: { "200": {} },
          },
        },
      },
      components: {
        schemas: {
          ItemId: { type: "string", format: "uuid" },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const paramSchema = resolved.paths["/items/{id}"]?.parameters?.[0]?.schema;

    expect(paramSchema?.type).toBe("string");
    expect(paramSchema?.format).toBe("uuid");
  });

  it("preserves _refName after resolving", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "RefName Test", version: "1.0.0" },
      paths: {
        "/items/{id}": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Item" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Item: {
            type: "object",
            properties: { id: { type: "string" } },
          },
        },
      },
    };

    const resolved = resolveRefs(spec);
    const schema = resolved.paths["/items/{id}"]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;

    expect(schema?._refName).toBe("Item");
  });
});
