import { describe, it, expect, vi } from "vitest";
import {
  extractEntities,
  enrichWithResponseInfo,
  toPascalCase,
} from "../openapi/pipeline/entity-extractor.js";
import type { OpenAPISpec, ExtractedEntity } from "../openapi/types.js";

// Mock logger to silence output
vi.mock("../utils/logger.js", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));

// ── enrichWithResponseInfo ──────────────────────────────────

describe("enrichWithResponseInfo", () => {
  it("enriches operations with response entity types from $ref", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/pets": {
          get: {
            operationId: "listPets",
            tags: ["Pet"],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Pet" },
                    },
                  },
                },
              },
            },
          },
        },
        "/pets/{petId}": {
          get: {
            operationId: "getPet",
            tags: ["Pet"],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Pet" },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "pet",
        pascalName: "Pet",
        pluralName: "pets",
        path: "/pets",
        fields: [],
        queryParams: [],
        operations: [
          { name: "list", method: "GET", path: "/pets", role: "list", hasInput: false, operationId: "listPets", queryParams: [] },
          { name: "get", method: "GET", path: "/pets/:petId", role: "get", hasInput: false, operationId: "getPet", queryParams: [] },
        ],
        tags: ["Pet"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);

    const listOp = entities[0].operations.find((o) => o.name === "list");
    expect(listOp?.responseEntityType).toBe("Pet");
    expect(listOp?.isArrayResponse).toBe(true);

    const getOp = entities[0].operations.find((o) => o.name === "get");
    expect(getOp?.responseEntityType).toBe("Pet");
    expect(getOp?.isArrayResponse).toBe(false);
  });

  it("derives modelType from GET single-item response when different from pascalName", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/admin/users/{userId}": {
          get: {
            operationId: "getAdminUser",
            tags: ["AdminUser"],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/UserAccountDetailDTO" },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "adminUser",
        pascalName: "AdminUser",
        pluralName: "adminUsers",
        path: "/admin/users",
        fields: [],
        queryParams: [],
        operations: [
          {
            name: "get",
            method: "GET",
            path: "/admin/users/:userId",
            role: "get",
            hasInput: false,
            operationId: "getAdminUser",
            queryParams: [],
          },
        ],
        tags: ["AdminUser"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);

    expect(entities[0].modelType).toBe("UserAccountDetailDTO");
  });

  it("returns undefined modelType when response matches pascalName", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/pets/{petId}": {
          get: {
            operationId: "getPet",
            tags: ["Pet"],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Pet" },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "pet",
        pascalName: "Pet",
        pluralName: "pets",
        path: "/pets",
        fields: [],
        queryParams: [],
        operations: [
          {
            name: "get",
            method: "GET",
            path: "/pets/:petId",
            role: "get",
            hasInput: false,
            operationId: "getPet",
            queryParams: [],
          },
        ],
        tags: ["Pet"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);
    expect(entities[0].modelType).toBeUndefined();
  });

  it("derives modelType from request body DTO suffix when no GET single-item", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/tasks": {
          post: {
            operationId: "createTask",
            tags: ["Task"],
            requestBody: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TaskCreateDTO" },
                },
              },
            },
            responses: {
              "201": {},
            },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "task",
        pascalName: "Task",
        pluralName: "tasks",
        path: "/tasks",
        fields: [],
        queryParams: [],
        operations: [
          {
            name: "create",
            method: "POST",
            path: "/tasks",
            role: "create",
            hasInput: true,
            operationId: "createTask",
            queryParams: [],
          },
        ],
        tags: ["Task"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);

    // "TaskCreateDTO" → strip "CreateDTO" → "Task" === pascalName → undefined modelType
    expect(entities[0].modelType).toBeUndefined();
  });

  it("derives modelType from request body when base differs from pascalName", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/admin/accounts": {
          post: {
            operationId: "createAccount",
            tags: ["Account"],
            requestBody: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserAccountCreateDTO" },
                },
              },
            },
            responses: { "201": {} },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "account",
        pascalName: "Account",
        pluralName: "accounts",
        path: "/admin/accounts",
        fields: [],
        queryParams: [],
        operations: [
          {
            name: "create",
            method: "POST",
            path: "/admin/accounts",
            role: "create",
            hasInput: true,
            operationId: "createAccount",
            queryParams: [],
          },
        ],
        tags: ["Account"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);

    // "UserAccountCreateDTO" → strip "CreateDTO" → "UserAccount" !== "Account"
    expect(entities[0].modelType).toBe("UserAccount");
  });

  it("handles operations without operationId", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/items": {
          get: {
            tags: ["Item"],
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
    };

    const entities: ExtractedEntity[] = [
      {
        name: "item",
        pascalName: "Item",
        pluralName: "items",
        path: "/items",
        fields: [],
        queryParams: [],
        operations: [
          { name: "list", method: "GET", path: "/items", role: "list", hasInput: false, queryParams: [] },
        ],
        tags: ["Item"],
      },
    ];

    // Should not throw
    enrichWithResponseInfo(rawSpec, entities);
  });

  it("handles boot-style inline envelope with body.$ref", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/users/{id}": {
          get: {
            operationId: "getUser",
            tags: ["User"],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      properties: {
                        body: {
                          $ref: "#/components/schemas/UserDetail",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "user",
        pascalName: "User",
        pluralName: "users",
        path: "/users",
        fields: [],
        queryParams: [],
        operations: [
          {
            name: "get", method: "GET", path: "/users/:id",
            role: "get", hasInput: false, operationId: "getUser", queryParams: [],
          },
        ],
        tags: ["User"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);
    expect(entities[0].operations[0].responseEntityType).toBe("UserDetail");
  });

  it("handles boot-style inline envelope with body.properties.content array", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/users": {
          get: {
            operationId: "listUsers",
            tags: ["User"],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      properties: {
                        body: {
                          properties: {
                            content: {
                              type: "array",
                              items: { $ref: "#/components/schemas/UserListDTO" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "user",
        pascalName: "User",
        pluralName: "users",
        path: "/users",
        fields: [],
        queryParams: [],
        operations: [
          {
            name: "list", method: "GET", path: "/users",
            role: "list", hasInput: false, operationId: "listUsers", queryParams: [],
          },
        ],
        tags: ["User"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);
    expect(entities[0].operations[0].responseEntityType).toBe("UserListDTO");
    expect(entities[0].operations[0].isArrayResponse).toBe(true);
  });

  it("handles request body with array $ref", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/batch": {
          post: {
            operationId: "batchUpdate",
            tags: ["Batch"],
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ItemBatchUpdateDTO" },
                  },
                },
              },
            },
            responses: { "200": {} },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "batch",
        pascalName: "Batch",
        pluralName: "batches",
        path: "/batch",
        fields: [],
        queryParams: [],
        operations: [
          {
            name: "batchUpdate", method: "POST", path: "/batch",
            role: "batchUpdate", hasInput: true, operationId: "batchUpdate", queryParams: [],
          },
        ],
        tags: ["Batch"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);
    // requestBodyMap contains "ItemBatchUpdateDTO" for "batchUpdate"
    // stripDtoSuffix extracts "ItemBatch" from array item ref
    expect(entities[0].modelType).toBe("ItemBatch");
  });

  it("handles response without content", () => {
    const rawSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/items/{id}": {
          delete: {
            operationId: "deleteItem",
            tags: ["Item"],
            responses: {
              "204": { description: "No Content" },
            },
          },
        },
      },
    };

    const entities: ExtractedEntity[] = [
      {
        name: "item",
        pascalName: "Item",
        pluralName: "items",
        path: "/items",
        fields: [],
        queryParams: [],
        operations: [
          {
            name: "delete", method: "DELETE", path: "/items/:id",
            role: "delete", hasInput: false, operationId: "deleteItem", queryParams: [],
          },
        ],
        tags: ["Item"],
      },
    ];

    enrichWithResponseInfo(rawSpec, entities);
    expect(entities[0].operations[0].responseEntityType).toBeUndefined();
  });
});

// ── extractEntities edge cases ──────────────────────────────

describe("extractEntities edge cases", () => {
  it("handles spec with no tags (uses default)", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/items": {
          get: {
            operationId: "listItems",
            responses: { "200": {} },
          },
        },
        "/items/{id}": {
          get: {
            operationId: "getItem",
            responses: { "200": {} },
          },
        },
      },
    };

    const entities = extractEntities(spec);
    expect(entities.length).toBeGreaterThanOrEqual(1);
    expect(entities[0].name).toBe("item");
  });

  it("handles spec with action endpoints on same resource", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/pet": {
          get: {
            operationId: "listPets",
            tags: ["pet"],
            responses: { "200": {} },
          },
          post: {
            operationId: "addPet",
            tags: ["pet"],
            requestBody: { content: { "application/json": {} } },
            responses: { "200": {} },
          },
        },
        "/pet/{petId}": {
          get: {
            operationId: "getPetById",
            tags: ["pet"],
            responses: { "200": {} },
          },
          delete: {
            operationId: "deletePet",
            tags: ["pet"],
            responses: { "200": {} },
          },
        },
        "/pet/findByStatus": {
          get: {
            operationId: "findPetsByStatus",
            tags: ["pet"],
            parameters: [{ name: "status", in: "query" }],
            responses: { "200": {} },
          },
        },
      },
    };

    const entities = extractEntities(spec);
    // All ops should be grouped under one entity
    const petEntity = entities.find((e) => e.name === "pet");
    expect(petEntity).toBeDefined();
    expect(petEntity!.operations.length).toBe(5);
  });

  it("detects parent resource from path", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/store/order": {
          get: {
            operationId: "listOrders",
            tags: ["store"],
            responses: { "200": {} },
          },
        },
        "/store/order/{orderId}": {
          get: {
            operationId: "getOrderById",
            tags: ["store"],
            responses: { "200": {} },
          },
        },
      },
    };

    const entities = extractEntities(spec);
    // Should extract "order" entity under store
    expect(entities.length).toBeGreaterThanOrEqual(1);
  });

  it("uses naming strategy when provided", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/api/v1/admin/user-accounts": {
          get: {
            operationId: "listAdminUserAccounts",
            tags: ["AdminUserAccount"],
            responses: { "200": {} },
          },
        },
      },
      tags: [{ name: "AdminUserAccount", "x-entity": "userAccount" }],
    };

    const naming: import("../openapi/naming/naming-strategy.js").OpenApiNamingStrategy = {
      resolveEntityName(ctx) {
        return (ctx.extensions["x-entity"] as string) ?? ctx.tag ?? "unknown";
      },
      resolveOperation(ctx) {
        return { role: "list", hookName: ctx.operationId };
      },
    };

    const entities = extractEntities(spec, undefined, naming);
    const entity = entities.find((e) => e.name === "userAccount");
    expect(entity).toBeDefined();
  });

  it("handles multipart content type in request body", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/upload": {
          post: {
            operationId: "uploadFile",
            tags: ["Upload"],
            requestBody: {
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: { file: { type: "string", format: "binary" } },
                  },
                },
              },
            },
            responses: { "200": {} },
          },
        },
      },
    };

    const entities = extractEntities(spec);
    const uploadEntity = entities.find((e) =>
      e.operations.some((op) => op.operationId === "uploadFile"),
    );
    expect(uploadEntity).toBeDefined();
    const op = uploadEntity!.operations.find((o) => o.operationId === "uploadFile");
    expect(op?.contentType).toBe("multipart");
    expect(op?.hasInput).toBe(true);
  });

  it("extracts query params from operations", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/users": {
          get: {
            operationId: "listUsers",
            tags: ["User"],
            parameters: [
              { name: "page", in: "query", schema: { type: "integer" } },
              { name: "size", in: "query", schema: { type: "integer" } },
              { name: "sort", in: "query", schema: { type: "string" } },
            ],
            responses: { "200": {} },
          },
        },
      },
    };

    const entities = extractEntities(spec);
    const userEntity = entities.find((e) => e.name === "user");
    expect(userEntity).toBeDefined();
    expect(userEntity!.queryParams.length).toBe(3);
    expect(userEntity!.queryParams.map((p) => p.name)).toContain("page");
  });

  it("deduplicates entities with same name from different tags", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/items": {
          get: {
            operationId: "listItems",
            tags: ["ItemsA"],
            responses: { "200": {} },
          },
        },
        "/items/{id}": {
          get: {
            operationId: "getItem",
            tags: ["ItemsB"],
            responses: { "200": {} },
          },
        },
      },
    };

    const naming: import("../openapi/naming/naming-strategy.js").OpenApiNamingStrategy = {
      resolveEntityName() {
        return "item"; // Both tags resolve to same name
      },
      resolveOperation(ctx) {
        return { role: "get", hookName: ctx.operationId };
      },
    };

    const entities = extractEntities(spec, undefined, naming);
    // Should be deduplicated to one entity with merged operations
    const itemEntities = entities.filter((e) => e.name === "item");
    expect(itemEntities.length).toBe(1);
    expect(itemEntities[0].operations.length).toBe(2);
  });

  it("handles CRUD patterns for role matching", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/tasks": {
          get: {
            operationId: "listTasks",
            tags: ["Task"],
            responses: { "200": {} },
          },
        },
        "/tasks/{taskId}": {
          get: {
            operationId: "getTask",
            tags: ["Task"],
            responses: { "200": {} },
          },
          put: {
            operationId: "updateTask",
            tags: ["Task"],
            requestBody: { content: { "application/json": {} } },
            responses: { "200": {} },
          },
          delete: {
            operationId: "deleteTask",
            tags: ["Task"],
            responses: { "204": {} },
          },
        },
      },
    };

    const crudPatterns = {
      list: { method: "GET" as const, path: "/" },
      get: { method: "GET" as const, path: "/:param" },
      update: { method: "PUT" as const, path: "/:param" },
      delete: { method: "DELETE" as const, path: "/:param" },
    };

    const entities = extractEntities(spec, crudPatterns);
    const task = entities.find((e) => e.name === "task");
    expect(task).toBeDefined();

    const listOp = task!.operations.find((o) => o.role === "list");
    expect(listOp).toBeDefined();

    const getOp = task!.operations.find((o) => o.role === "get");
    expect(getOp).toBeDefined();
  });

  it("extracts schema with additionalProperties and creates schemaOverride", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0" },
      paths: {
        "/inventory": {
          get: {
            operationId: "getInventory",
            tags: ["store"],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities = extractEntities(spec);
    const inventoryEntity = entities.find((e) =>
      e.operations.some((o) => o.operationId === "getInventory"),
    );
    expect(inventoryEntity).toBeDefined();
    expect(inventoryEntity!.schemaOverride).toContain("z.record");
  });
});

// ── toPascalCase ────────────────────────────────────────────

describe("toPascalCase", () => {
  it("converts kebab-case", () => {
    expect(toPascalCase("user-account")).toBe("UserAccount");
  });

  it("converts snake_case", () => {
    expect(toPascalCase("user_account")).toBe("UserAccount");
  });

  it("converts space-separated", () => {
    expect(toPascalCase("user account")).toBe("UserAccount");
  });

  it("handles single word", () => {
    expect(toPascalCase("user")).toBe("User");
  });
});
