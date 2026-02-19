import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { ApiContractConfig } from "@simplix-react/contract";
import { deriveMockHandlers } from "../derive-mock-handlers.js";

// Minimal entity schemas for testing
const taskSchema = z.object({ id: z.string(), title: z.string() });
const taskCreateInput = z.object({ title: z.string() });
const taskUpdateInput = z.object({ title: z.string().optional() });

const memberSchema = z.object({ id: z.string(), name: z.string() });
const memberCreateInput = z.object({ name: z.string() });
const memberUpdateInput = z.object({ name: z.string().optional() });

function createBasicConfig(): ApiContractConfig {
  return {
    domain: "project",
    basePath: "/api/v1",
    entities: {
      task: {
        schema: taskSchema,
        operations: {
          list:   { method: "GET",    path: "/tasks" },
          get:    { method: "GET",    path: "/tasks/:id" },
          create: { method: "POST",   path: "/tasks", input: taskCreateInput },
          update: { method: "PATCH",  path: "/tasks/:id", input: taskUpdateInput },
          delete: { method: "DELETE", path: "/tasks/:id" },
        },
      },
    },
  };
}

describe("deriveMockHandlers", () => {
  it("returns an array of handlers", () => {
    const handlers = deriveMockHandlers(createBasicConfig());
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
  });

  it("generates 5 handlers for entity with 5 CRUD operations", () => {
    const config = createBasicConfig();
    const handlers = deriveMockHandlers(config);

    // Each CRUD operation: GET list + GET by id + POST + PATCH + DELETE = 5
    expect(handlers).toHaveLength(5);
  });

  it("generates handlers for entity with parent (parent-scoped list and create)", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            list:   { method: "GET",    path: "/tasks" },
            get:    { method: "GET",    path: "/tasks/:id" },
            create: { method: "POST",   path: "/tasks", input: taskCreateInput },
            update: { method: "PATCH",  path: "/tasks/:id", input: taskUpdateInput },
            delete: { method: "DELETE", path: "/tasks/:id" },
          },
          parent: {
            param: "projectId",
            path: "/projects",
          },
        },
      },
    };

    const handlers = deriveMockHandlers(config);

    // Entity with parent: GET list (parent path) + GET by id + POST (parent path) + PATCH + DELETE = 5
    expect(handlers).toHaveLength(5);
  });

  it("generates correct number of handlers for multiple entities", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            list:   { method: "GET",    path: "/tasks" },
            get:    { method: "GET",    path: "/tasks/:id" },
            create: { method: "POST",   path: "/tasks", input: taskCreateInput },
            update: { method: "PATCH",  path: "/tasks/:id", input: taskUpdateInput },
            delete: { method: "DELETE", path: "/tasks/:id" },
          },
        },
        member: {
          schema: memberSchema,
          operations: {
            list:   { method: "GET",    path: "/members" },
            get:    { method: "GET",    path: "/members/:id" },
            create: { method: "POST",   path: "/members", input: memberCreateInput },
            update: { method: "PATCH",  path: "/members/:id", input: memberUpdateInput },
            delete: { method: "DELETE", path: "/members/:id" },
          },
        },
      },
    };

    const handlers = deriveMockHandlers(config);

    // 2 entities * 5 handlers each = 10
    expect(handlers).toHaveLength(10);
  });

  it("generates handlers with mixed parent and non-parent entities", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        project: {
          schema: z.object({ id: z.string(), name: z.string() }),
          operations: {
            list:   { method: "GET",    path: "/projects" },
            get:    { method: "GET",    path: "/projects/:id" },
            create: { method: "POST",   path: "/projects", input: z.object({ name: z.string() }) },
            update: { method: "PATCH",  path: "/projects/:id", input: z.object({ name: z.string().optional() }) },
            delete: { method: "DELETE", path: "/projects/:id" },
          },
        },
        task: {
          schema: taskSchema,
          operations: {
            list:   { method: "GET",    path: "/tasks" },
            get:    { method: "GET",    path: "/tasks/:id" },
            create: { method: "POST",   path: "/tasks", input: taskCreateInput },
            update: { method: "PATCH",  path: "/tasks/:id", input: taskUpdateInput },
            delete: { method: "DELETE", path: "/tasks/:id" },
          },
          parent: {
            param: "projectId",
            path: "/projects",
          },
        },
      },
    };

    const handlers = deriveMockHandlers(config);

    // project: 5 handlers (no parent) + task: 5 handlers (with parent) = 10
    expect(handlers).toHaveLength(10);
  });

  it("accepts optional mockConfig without error", () => {
    const config = createBasicConfig();
    const handlers = deriveMockHandlers(config, {
      task: {
        defaultLimit: 20,
        maxLimit: 200,
        defaultSort: "title:asc",
      },
    });

    expect(handlers).toHaveLength(5);
  });

  it("accepts mockConfig with relations without error", () => {
    const config = createBasicConfig();
    const handlers = deriveMockHandlers(config, {
      task: {
        relations: {
          project: {
            entity: "projects",
            localKey: "projectId",
            type: "belongsTo",
          },
        },
      },
    });

    expect(handlers).toHaveLength(5);
  });

  it("returns empty array when entities is empty", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: "/api/v1",
      entities: {},
    };

    const handlers = deriveMockHandlers(config);

    expect(handlers).toHaveLength(0);
  });

  it("all returned handlers are MSW handler objects", () => {
    const handlers = deriveMockHandlers(createBasicConfig());

    for (const handler of handlers) {
      expect(handler).toBeDefined();
      expect(typeof handler).toBe("object");
    }
  });

  it("generates handlers for custom operations without CRUD role", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            list:       { method: "GET",    path: "/tasks" },
            get:        { method: "GET",    path: "/tasks/:id" },
            archive:    { method: "POST",   path: "/tasks/:id/archive" },
            bulkDelete: { method: "POST",   path: "/tasks/bulk-delete" },
          },
        },
      },
    };

    const handlers = deriveMockHandlers(config);

    // list + get + archive (custom) + bulkDelete (custom) = 4
    expect(handlers).toHaveLength(4);
  });

  it("generates handler for tree role operation", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        category: {
          schema: z.object({ id: z.string(), name: z.string(), parentId: z.string().nullable() }),
          operations: {
            list: { method: "GET", path: "/categories" },
            tree: { method: "GET", path: "/categories/tree" },
          },
        },
      },
    };

    const handlers = deriveMockHandlers(config);

    // list + tree = 2
    expect(handlers).toHaveLength(2);
  });

  it("entity with only list and get generates 2 handlers", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            list: { method: "GET", path: "/tasks" },
            get:  { method: "GET", path: "/tasks/:id" },
          },
        },
      },
    };

    const handlers = deriveMockHandlers(config);

    expect(handlers).toHaveLength(2);
  });
});
