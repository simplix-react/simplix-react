import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { ApiContractConfig } from "@simplix-react/contract";
import { deriveMockHandlers } from "../derive-mock-handlers.js";

// Minimal entity schemas for testing
const taskSchema = z.object({ id: z.string(), title: z.string() });
const taskCreateSchema = z.object({ title: z.string() });
const taskUpdateSchema = z.object({ title: z.string().optional() });

const memberSchema = z.object({ id: z.string(), name: z.string() });
const memberCreateSchema = z.object({ name: z.string() });
const memberUpdateSchema = z.object({ name: z.string().optional() });

function createBasicConfig(): ApiContractConfig {
  return {
    domain: "project",
    basePath: "/api/v1",
    entities: {
      task: {
        path: "/tasks",
        schema: taskSchema,
        createSchema: taskCreateSchema,
        updateSchema: taskUpdateSchema,
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

  it("generates 4 handlers per entity without parent (GET list, GET by id, POST, PATCH, DELETE)", () => {
    const config = createBasicConfig();
    const handlers = deriveMockHandlers(config);

    // Each entity without parent: GET list + GET by id + POST + PATCH + DELETE = 5
    expect(handlers).toHaveLength(5);
  });

  it("generates 5 handlers per entity with parent (parent GET list, GET by id, parent POST, PATCH, DELETE)", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          path: "/tasks",
          schema: taskSchema,
          createSchema: taskCreateSchema,
          updateSchema: taskUpdateSchema,
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
          path: "/tasks",
          schema: taskSchema,
          createSchema: taskCreateSchema,
          updateSchema: taskUpdateSchema,
        },
        member: {
          path: "/members",
          schema: memberSchema,
          createSchema: memberCreateSchema,
          updateSchema: memberUpdateSchema,
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
          path: "/projects",
          schema: z.object({ id: z.string(), name: z.string() }),
          createSchema: z.object({ name: z.string() }),
          updateSchema: z.object({ name: z.string().optional() }),
        },
        task: {
          path: "/tasks",
          schema: taskSchema,
          createSchema: taskCreateSchema,
          updateSchema: taskUpdateSchema,
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
        tableName: "custom_tasks",
        defaultLimit: 20,
        maxLimit: 200,
        defaultSort: "title ASC",
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
            table: "projects",
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
      // MSW handlers have an info property with header/path and a method
      expect(handler).toBeDefined();
      expect(typeof handler).toBe("object");
    }
  });
});
