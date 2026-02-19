import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { defineApi } from "../define-api.js";
import { deriveQueryKeys } from "../derive/query-keys.js";
import { simpleQueryBuilder } from "../helpers/query-builders.js";
import type { ListParams } from "../helpers/query-types.js";

interface EntityClientShape {
  list: (parentIdOrParams?: string | ListParams, params?: ListParams) => Promise<unknown>;
  get: (id: string) => Promise<unknown>;
  create: (parentIdOrDto: unknown, dto?: unknown) => Promise<unknown>;
  update: (id: string, dto: unknown) => Promise<unknown>;
  delete: (id: string) => Promise<void>;
}

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
});
const createTaskDto = z.object({ title: z.string() });
const updateTaskDto = z.object({ title: z.string().optional() });

describe("deriveQueryKeys", () => {
  const config = {
    domain: "tasks",
    basePath: "/api",
    entities: {
      task: {
        schema: taskSchema,
        operations: {
          list:   { method: "GET" as const,    path: "/tasks" },
          get:    { method: "GET" as const,    path: "/tasks/:id" },
          create: { method: "POST" as const,   path: "/tasks", input: createTaskDto },
          update: { method: "PATCH" as const,  path: "/tasks/:id", input: updateTaskDto },
          delete: { method: "DELETE" as const, path: "/tasks/:id" },
        },
      },
    },
  };

  it("generates all key for entity", () => {
    const keys = deriveQueryKeys(config);
    expect(keys.task.all).toEqual(["tasks", "task"]);
  });

  it("generates lists key", () => {
    const keys = deriveQueryKeys(config);
    expect(keys.task.lists()).toEqual(["tasks", "task", "list"]);
  });

  it("generates list key with params", () => {
    const keys = deriveQueryKeys(config);
    expect(keys.task.list({ status: "done" })).toEqual(["tasks", "task", "list", { status: "done" }]);
  });

  it("generates detail key", () => {
    const keys = deriveQueryKeys(config);
    expect(keys.task.detail("123")).toEqual(["tasks", "task", "detail", "123"]);
  });

  it("generates trees key", () => {
    const keys = deriveQueryKeys(config);
    expect(keys.task.trees()).toEqual(["tasks", "task", "tree"]);
  });

  it("generates tree key with params", () => {
    const keys = deriveQueryKeys(config);
    expect(keys.task.tree({ rootId: "abc" })).toEqual(["tasks", "task", "tree", { rootId: "abc" }]);
  });

  it("generates tree key without params", () => {
    const keys = deriveQueryKeys(config);
    expect(keys.task.tree()).toEqual(["tasks", "task", "tree"]);
  });

  it("generates detail key with composite key (Record)", () => {
    const keys = deriveQueryKeys(config);
    expect(keys.task.detail({ tenantId: "tenant-1", productId: "product-1" })).toEqual(
      ["tasks", "task", "detail", { tenantId: "tenant-1", productId: "product-1" }],
    );
  });
});

describe("defineApi", () => {
  it("returns config, client, and queryKeys", () => {
    const api = defineApi({
      domain: "tasks",
      basePath: "/api",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            list:   { method: "GET" as const,    path: "/tasks" },
            get:    { method: "GET" as const,    path: "/tasks/:id" },
            create: { method: "POST" as const,   path: "/tasks", input: createTaskDto },
            update: { method: "PATCH" as const,  path: "/tasks/:id", input: updateTaskDto },
            delete: { method: "DELETE" as const, path: "/tasks/:id" },
          },
        },
      },
    });

    expect(api.config).toBeDefined();
    expect(api.client).toBeDefined();
    expect(api.queryKeys).toBeDefined();
    expect(api.client.task).toBeDefined();
    expect(api.queryKeys.task).toBeDefined();
  });

  it("passes queryBuilder through config", () => {
    const api = defineApi({
      domain: "tasks",
      basePath: "/api",
      queryBuilder: simpleQueryBuilder,
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            list:   { method: "GET" as const,    path: "/tasks" },
            get:    { method: "GET" as const,    path: "/tasks/:id" },
            create: { method: "POST" as const,   path: "/tasks", input: createTaskDto },
            update: { method: "PATCH" as const,  path: "/tasks/:id", input: updateTaskDto },
            delete: { method: "DELETE" as const, path: "/tasks/:id" },
          },
        },
      },
    });

    expect(api.config.queryBuilder).toBe(simpleQueryBuilder);
  });
});

describe("deriveClient.list with queryBuilder", () => {
  it("appends query params when queryBuilder is set", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);

    const api = defineApi(
      {
        domain: "tasks",
        basePath: "/api",
        queryBuilder: simpleQueryBuilder,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              list:   { method: "GET" as const,    path: "/tasks" },
              get:    { method: "GET" as const,    path: "/tasks/:id" },
              create: { method: "POST" as const,   path: "/tasks", input: createTaskDto },
              update: { method: "PATCH" as const,  path: "/tasks/:id", input: updateTaskDto },
              delete: { method: "DELETE" as const, path: "/tasks/:id" },
            },
          },
        },
      },
      { fetchFn: mockFetch },
    );

    const taskClient = api.client.task as EntityClientShape;
    await taskClient.list({
      filters: { status: "pending" },
      pagination: { type: "offset", page: 1, limit: 10 },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tasks?status=pending&page=1&limit=10",
    );
  });

  it("works without queryBuilder (ignores params)", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);

    const api = defineApi(
      {
        domain: "tasks",
        basePath: "/api",
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              list:   { method: "GET" as const,    path: "/tasks" },
              get:    { method: "GET" as const,    path: "/tasks/:id" },
              create: { method: "POST" as const,   path: "/tasks", input: createTaskDto },
              update: { method: "PATCH" as const,  path: "/tasks/:id", input: updateTaskDto },
              delete: { method: "DELETE" as const, path: "/tasks/:id" },
            },
          },
        },
      },
      { fetchFn: mockFetch },
    );

    const taskClient = api.client.task as EntityClientShape;
    await taskClient.list({ filters: { status: "done" } });

    // No queryBuilder, so params object is treated as a non-string arg
    // The URL should not have query params appended
    expect(mockFetch).toHaveBeenCalledWith("/api/tasks");
  });

  it("supports parentId + params", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);

    const api = defineApi(
      {
        domain: "topology",
        basePath: "/api",
        queryBuilder: simpleQueryBuilder,
        entities: {
          controller: {
            schema: taskSchema,
            operations: {
              list:   { method: "GET" as const,    path: "/controllers" },
              get:    { method: "GET" as const,    path: "/controllers/:id" },
              create: { method: "POST" as const,   path: "/controllers", input: createTaskDto },
              update: { method: "PATCH" as const,  path: "/controllers/:id", input: updateTaskDto },
              delete: { method: "DELETE" as const, path: "/controllers/:id" },
            },
            parent: { param: "topologyId", path: "/topologies" },
          },
        },
      },
      { fetchFn: mockFetch },
    );

    const controllerClient = api.client.controller as EntityClientShape;
    await controllerClient.list("topo-1", {
      sort: { field: "name", direction: "asc" },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/topologies/topo-1/controllers?sort=name%3Aasc",
    );
  });
});
