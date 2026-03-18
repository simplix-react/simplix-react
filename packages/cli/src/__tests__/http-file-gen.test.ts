import { describe, it, expect } from "vitest";
import { generateHttpFile, generateHttpEnvJson } from "../openapi/generation/http-file-gen.js";
import type { ExtractedEntity } from "../openapi/types.js";

function makeEntity(overrides: Partial<ExtractedEntity> = {}): ExtractedEntity {
  return {
    name: "user",
    pascalName: "User",
    pluralName: "users",
    path: "/users",
    fields: [],
    queryParams: [],
    operations: [],
    tags: [],
    ...overrides,
  };
}

// ── generateHttpFile ────────────────────────────────────────

describe("generateHttpFile", () => {
  it("generates GET request without body", () => {
    const entity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", hasInput: false, queryParams: [] },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain("### List User");
    expect(output).toContain("GET {{baseUrl}}/api/users");
    expect(output).toContain("Accept: application/json");
    expect(output).not.toContain("Content-Type");
  });

  it("generates POST request with body from schema", () => {
    const entity = makeEntity({
      operations: [
        {
          name: "create",
          method: "POST",
          path: "/users",
          hasInput: true,
          bodySchema: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              age: { type: "integer" },
              active: { type: "boolean" },
            },
          },
          queryParams: [],
        },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain("### Create User");
    expect(output).toContain("POST {{baseUrl}}/api/users");
    expect(output).toContain("Content-Type: application/json");
    expect(output).toContain('"name": "sample-name"');
    expect(output).toContain('"email": "user@example.com"');
    expect(output).toContain('"age": 1');
    expect(output).toContain('"active": true');
  });

  it("generates DELETE request without body", () => {
    const entity = makeEntity({
      operations: [
        { name: "delete", method: "DELETE", path: "/users/:id", hasInput: false, queryParams: [] },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain("DELETE {{baseUrl}}/api/users/{{id}}");
    expect(output).toContain("Accept: application/json");
  });

  it("converts :param to {{param}} format", () => {
    const entity = makeEntity({
      operations: [
        { name: "get", method: "GET", path: "/users/:userId", hasInput: false, queryParams: [] },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain("/users/{{userId}}");
  });

  it("includes query params in URL", () => {
    const entity = makeEntity({
      operations: [
        {
          name: "list",
          method: "GET",
          path: "/users",
          hasInput: false,
          queryParams: [
            { name: "page", type: "integer", required: false },
            { name: "size", type: "integer", required: false },
          ],
        },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain("?page={{page}}&size={{size}}");
  });

  it("generates body with enum values (first option)", () => {
    const entity = makeEntity({
      operations: [
        {
          name: "create",
          method: "POST",
          path: "/users",
          hasInput: true,
          bodySchema: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["active", "inactive"] },
            },
          },
          queryParams: [],
        },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain('"status": "active"');
  });

  it("generates body with various format samples", () => {
    const entity = makeEntity({
      operations: [
        {
          name: "create",
          method: "POST",
          path: "/users",
          hasInput: true,
          bodySchema: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              createdAt: { type: "string", format: "date-time" },
              birthDate: { type: "string", format: "date" },
              website: { type: "string", format: "uri" },
              ip: { type: "string", format: "ipv4" },
            },
          },
          queryParams: [],
        },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain("00000000-0000-0000-0000-000000000001");
    expect(output).toContain("example.com");
    expect(output).toContain("192.168.1.1");
  });

  it("generates body with number and boolean types", () => {
    const entity = makeEntity({
      operations: [
        {
          name: "create",
          method: "POST",
          path: "/users",
          hasInput: true,
          bodySchema: {
            type: "object",
            properties: {
              count: { type: "number" },
              flag: { type: "boolean" },
              items: { type: "array" },
              meta: { type: "object" },
            },
          },
          queryParams: [],
        },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain('"count": 1');
    expect(output).toContain('"flag": true');
    expect(output).toContain('"items": []');
  });

  it("generates multiple operations", () => {
    const entity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", hasInput: false, queryParams: [] },
        { name: "get", method: "GET", path: "/users/:id", hasInput: false, queryParams: [] },
        { name: "create", method: "POST", path: "/users", hasInput: true, bodySchema: { type: "object", properties: { name: { type: "string" } } }, queryParams: [] },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain("### List User");
    expect(output).toContain("### Get User");
    expect(output).toContain("### Create User");
  });

  it("handles PUT/PATCH with Content-Type", () => {
    const entity = makeEntity({
      operations: [
        {
          name: "update",
          method: "PUT",
          path: "/users/:id",
          hasInput: true,
          bodySchema: { type: "object", properties: { name: { type: "string" } } },
          queryParams: [],
        },
      ],
    });

    const output = generateHttpFile(entity, "/api");
    expect(output).toContain("Content-Type: application/json");
    expect(output).not.toContain("Accept: application/json");
  });
});

// ── generateHttpEnvJson ─────────────────────────────────────

describe("generateHttpEnvJson", () => {
  it("generates env json from config environments", () => {
    const config = {
      http: {
        environments: {
          development: { baseUrl: "http://localhost:3000" },
          production: { baseUrl: "https://api.example.com" },
        },
      },
    } as unknown as import("../../src/config/types.js").SimplixConfig;

    const output = generateHttpEnvJson(config);
    const parsed = JSON.parse(output);
    expect(parsed.development.baseUrl).toBe("http://localhost:3000");
    expect(parsed.production.baseUrl).toBe("https://api.example.com");
  });

  it("uses default environment when config has no http section", () => {
    const config = {} as unknown as import("../../src/config/types.js").SimplixConfig;

    const output = generateHttpEnvJson(config);
    const parsed = JSON.parse(output);
    expect(parsed.development.baseUrl).toBe("http://localhost:3000");
  });
});
