import { describe, it, expect, afterEach } from "vitest";
import { getResponse } from "msw";
import { z } from "zod";
import { wired } from "@simplix-react/contract";
import type { ApiContractConfig } from "@simplix-react/contract";
import { deriveMockHandlers } from "../derive-mock-handlers.js";
import { resetStore, seedEntityStore } from "../mock-store.js";

// ── Constants ──

const BASE = "http://test.local/api/v1";

// ── Test Schemas ──

const taskSchema = z.object({ id: z.string(), title: z.string() });
const taskCreateInput = z.object({ title: z.string() });
const taskUpdateInput = z.object({ title: z.string().optional() });

const memberSchema = z.object({ id: z.string(), name: z.string() });
const memberCreateInput = z.object({ name: z.string() });
const memberUpdateInput = z.object({ name: z.string().optional() });

// ── Helper ──

function createBasicConfig(): ApiContractConfig {
  return {
    domain: "project",
    basePath: BASE,
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

async function request(
  handlers: ReturnType<typeof deriveMockHandlers>,
  url: string,
  init?: RequestInit,
) {
  const req = new Request(url, init);
  const res = await getResponse(handlers, req);
  if (!res) throw new Error(`No handler matched: ${init?.method ?? "GET"} ${url}`);
  return res;
}

async function json(res: Response) {
  return res.json();
}

// ── Handler Count Tests ──

describe("deriveMockHandlers — handler count", () => {
  it("returns an array of handlers", () => {
    const handlers = deriveMockHandlers(createBasicConfig());
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
  });

  it("generates 5 handlers for entity with 5 CRUD operations", () => {
    const handlers = deriveMockHandlers(createBasicConfig());
    expect(handlers).toHaveLength(5);
  });

  it("generates handlers for entity with parent (parent-scoped list and create)", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: BASE,
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
          parent: { param: "projectId", path: "/projects" },
        },
      },
    };

    const handlers = deriveMockHandlers(config);
    expect(handlers).toHaveLength(5);
  });

  it("generates correct number of handlers for multiple entities", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: BASE,
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
    expect(handlers).toHaveLength(10);
  });

  it("returns empty array when entities is empty", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: BASE,
      entities: {},
    };
    expect(deriveMockHandlers(config)).toHaveLength(0);
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
      basePath: BASE,
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            list:       { method: "GET",  path: "/tasks" },
            get:        { method: "GET",  path: "/tasks/:id" },
            archive:    { method: "POST", path: "/tasks/:id/archive" },
            bulkDelete: { method: "POST", path: "/tasks/bulk-delete" },
          },
        },
      },
    };

    expect(deriveMockHandlers(config)).toHaveLength(4);
  });

  it("generates handler for tree role operation", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: BASE,
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

    expect(deriveMockHandlers(config)).toHaveLength(2);
  });

  it("entity with only list and get generates 2 handlers", () => {
    const config: ApiContractConfig = {
      domain: "project",
      basePath: BASE,
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

    expect(deriveMockHandlers(config)).toHaveLength(2);
  });
});

// ── Behavioral Tests ──

describe("deriveMockHandlers — behavior", () => {
  afterEach(() => {
    resetStore();
  });

  // ── list ──

  describe("list operation", () => {
    it("returns all records from store", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "Task A", createdAt: "2025-01-01" },
        { id: 2, title: "Task B", createdAt: "2025-01-02" },
      ]);

      const res = await request(handlers, `${BASE}/tasks`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.data).toHaveLength(2);
    });

    it("supports filtering by query parameters", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "A", status: "done", createdAt: "2025-01-01" },
        { id: 2, title: "B", status: "open", createdAt: "2025-01-02" },
        { id: 3, title: "C", status: "done", createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?status=done`);
      const body = await json(res);

      expect(body.data.data).toHaveLength(2);
    });

    it("supports pagination with page parameter", async () => {
      const handlers = deriveMockHandlers(createBasicConfig(), {
        task: { defaultLimit: 2, maxLimit: 10 },
      });
      seedEntityStore("project_task", [
        { id: 1, title: "A", createdAt: "2025-01-01" },
        { id: 2, title: "B", createdAt: "2025-01-02" },
        { id: 3, title: "C", createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?page=0&limit=2`);
      const body = await json(res);

      expect(body.data.data).toHaveLength(2);
      expect(body.data.meta).toBeDefined();
      expect(body.data.meta.total).toBe(3);
      expect(body.data.meta.hasNextPage).toBe(true);
    });

    it("supports cursor-based pagination trigger", async () => {
      const handlers = deriveMockHandlers(createBasicConfig(), {
        task: { defaultLimit: 2 },
      });
      seedEntityStore("project_task", [
        { id: 1, title: "A", createdAt: "2025-01-01" },
        { id: 2, title: "B", createdAt: "2025-01-02" },
        { id: 3, title: "C", createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?cursor=abc`);
      const body = await json(res);

      expect(body.data.meta).toBeDefined();
      expect(body.data.meta.total).toBe(3);
    });

    it("respects maxLimit config", async () => {
      const handlers = deriveMockHandlers(createBasicConfig(), {
        task: { defaultLimit: 50, maxLimit: 2 },
      });
      seedEntityStore("project_task", [
        { id: 1, title: "A", createdAt: "2025-01-01" },
        { id: 2, title: "B", createdAt: "2025-01-02" },
        { id: 3, title: "C", createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?page=0&limit=100`);
      const body = await json(res);

      expect(body.data.data).toHaveLength(2);
      expect(body.data.meta.limit).toBe(2);
    });

    it("supports sort query parameter (colon format)", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "C", createdAt: "2025-01-03" },
        { id: 2, title: "A", createdAt: "2025-01-01" },
        { id: 3, title: "B", createdAt: "2025-01-02" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?sort=title:asc`);
      const body = await json(res);

      expect(body.data.data[0].title).toBe("A");
      expect(body.data.data[1].title).toBe("B");
      expect(body.data.data[2].title).toBe("C");
    });

    it("supports sort in dot format", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "C", createdAt: "2025-01-03" },
        { id: 2, title: "A", createdAt: "2025-01-01" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?sort=title.desc`);
      const body = await json(res);

      expect(body.data.data[0].title).toBe("C");
      expect(body.data.data[1].title).toBe("A");
    });

    it("supports size query parameter as alias for limit", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "A", createdAt: "2025-01-01" },
        { id: 2, title: "B", createdAt: "2025-01-02" },
        { id: 3, title: "C", createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?page=0&size=1`);
      const body = await json(res);

      expect(body.data.data).toHaveLength(1);
      expect(body.data.meta.limit).toBe(1);
    });

    it("uses default sort when not specified", async () => {
      const handlers = deriveMockHandlers(createBasicConfig(), {
        task: { defaultSort: "title:asc" },
      });
      seedEntityStore("project_task", [
        { id: 1, title: "Z", createdAt: "2025-01-01" },
        { id: 2, title: "A", createdAt: "2025-01-02" },
      ]);

      const res = await request(handlers, `${BASE}/tasks`);
      const body = await json(res);

      expect(body.data.data[0].title).toBe("A");
      expect(body.data.data[1].title).toBe("Z");
    });

    it("returns data without meta when no pagination params", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "A", createdAt: "2025-01-01" },
      ]);

      const res = await request(handlers, `${BASE}/tasks`);
      const body = await json(res);

      expect(body.data.data).toBeDefined();
      expect(body.data.meta).toBeUndefined();
    });
  });

  // ── list with parent ──

  describe("list with parent entity", () => {
    it("filters by parent param from the URL", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              list: { method: "GET", path: "/tasks" },
            },
            parent: { param: "projectId", path: "/projects" },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [
        { id: 1, title: "A", projectId: "10", createdAt: "2025-01-01" },
        { id: 2, title: "B", projectId: "20", createdAt: "2025-01-02" },
        { id: 3, title: "C", projectId: "10", createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/projects/10/tasks`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.data).toHaveLength(2);
      for (const item of body.data.data) {
        expect(item.projectId).toBe("10");
      }
    });
  });

  // ── get ──

  describe("get operation", () => {
    it("returns a single record by id", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "Task A", createdAt: "2025-01-01" },
      ]);

      const res = await request(handlers, `${BASE}/tasks/1`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.title).toBe("Task A");
    });

    it("returns 404 for non-existent record", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());

      const res = await request(handlers, `${BASE}/tasks/999`);
      const body = await json(res);

      expect(res.status).toBe(404);
      expect(body.code).toBe("not_found");
    });

    it("loads belongsTo relations when configured", async () => {
      const config: ApiContractConfig = {
        domain: "test",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              get: { method: "GET", path: "/tasks/:id" },
            },
          },
          project: {
            schema: z.object({ id: z.string(), name: z.string() }),
            operations: {
              get: { method: "GET", path: "/projects/:id" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config, {
        task: {
          relations: {
            project: { entity: "project", localKey: "projectId", type: "belongsTo" },
          },
        },
      });
      seedEntityStore("test_project", [{ id: 1, name: "Project X" }]);
      seedEntityStore("test_task", [{ id: 1, title: "Task A", projectId: 1 }]);

      const res = await request(handlers, `${BASE}/tasks/1`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.project).toBeDefined();
      expect(body.data.project.name).toBe("Project X");
    });

    it("loads relation with custom foreignKey", async () => {
      const config: ApiContractConfig = {
        domain: "test",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              get: { method: "GET", path: "/tasks/:id" },
            },
          },
          user: {
            schema: z.object({ id: z.string(), code: z.string(), name: z.string() }),
            operations: {
              get: { method: "GET", path: "/users/:id" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config, {
        task: {
          relations: {
            assignee: { entity: "user", localKey: "assigneeCode", foreignKey: "code", type: "belongsTo" },
          },
        },
      });
      seedEntityStore("test_user", [{ id: 1, code: "U001", name: "Alice" }]);
      seedEntityStore("test_task", [{ id: 1, title: "Task A", assigneeCode: "U001" }]);

      const res = await request(handlers, `${BASE}/tasks/1`);
      const body = await json(res);

      expect(body.data.assignee).toBeDefined();
      expect(body.data.assignee.name).toBe("Alice");
    });

    it("returns record without relation when fk is null", async () => {
      const config: ApiContractConfig = {
        domain: "test",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              get: { method: "GET", path: "/tasks/:id" },
            },
          },
          project: {
            schema: z.object({ id: z.string(), name: z.string() }),
            operations: {
              get: { method: "GET", path: "/projects/:id" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config, {
        task: {
          relations: {
            project: { entity: "project", localKey: "projectId", type: "belongsTo" },
          },
        },
      });
      seedEntityStore("test_task", [{ id: 1, title: "Task A", projectId: null }]);

      const res = await request(handlers, `${BASE}/tasks/1`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.project).toBeUndefined();
    });

    it("returns 404 with relations when record not found", async () => {
      const config: ApiContractConfig = {
        domain: "test",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              get: { method: "GET", path: "/tasks/:id" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config, {
        task: {
          relations: {
            project: { entity: "project", localKey: "projectId", type: "belongsTo" },
          },
        },
      });

      const res = await request(handlers, `${BASE}/tasks/999`);
      const body = await json(res);

      expect(res.status).toBe(404);
      expect(body.code).toBe("not_found");
    });
  });

  // ── create ──

  describe("create operation", () => {
    it("creates a record and returns 201", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());

      const res = await request(handlers, `${BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Task" }),
      });
      const body = await json(res);

      expect(res.status).toBe(201);
      expect(body.data.title).toBe("New Task");
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
      expect(body.data.updatedAt).toBeDefined();
    });

    it("auto-generates id when not provided", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());

      const res = await request(handlers, `${BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Auto ID" }),
      });
      const body = await json(res);

      expect(body.data.id).toBe(1);
    });

    it("preserves provided id", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());

      const res = await request(handlers, `${BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 42, title: "Manual ID" }),
      });
      const body = await json(res);

      expect(body.data.id).toBe(42);
    });

    it("creates with parent param injected", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              create: { method: "POST", path: "/tasks", input: taskCreateInput },
            },
            parent: { param: "projectId", path: "/projects" },
          },
        },
      };
      const handlers = deriveMockHandlers(config);

      const res = await request(handlers, `${BASE}/projects/10/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Parent Create" }),
      });
      const body = await json(res);

      expect(res.status).toBe(201);
      expect(body.data.projectId).toBe("10");
      expect(body.data.title).toBe("Parent Create");
    });
  });

  // ── update ──

  describe("update operation", () => {
    it("updates an existing record", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "Original", createdAt: "2025-01-01" },
      ]);

      const res = await request(handlers, `${BASE}/tasks/1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Updated" }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.title).toBe("Updated");
      expect(body.data.updatedAt).toBeDefined();
    });

    it("returns 404 for non-existent record", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());

      const res = await request(handlers, `${BASE}/tasks/999`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Ghost" }),
      });
      const body = await json(res);

      expect(res.status).toBe(404);
      expect(body.code).toBe("not_found");
    });

    it("returns 400 for invalid JSON body", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "Original" },
      ]);

      const res = await request(handlers, `${BASE}/tasks/1`, {
        method: "PATCH",
        headers: { "Content-Type": "text/plain" },
        body: "",
      });
      const body = await json(res);

      expect(res.status).toBe(400);
      expect(body.code).toBe("bad_request");
    });

    it("falls back to dto.id when no route param id", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          pet: {
            schema: z.object({ id: z.number(), name: z.string() }),
            operations: {
              update: { method: "PUT", path: "/pet", role: "update" as const },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_pet", [{ id: 1, name: "Buddy" }]);

      const res = await request(handlers, `${BASE}/pet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 1, name: "MaxUpdated" }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.name).toBe("MaxUpdated");
    });
  });

  // ── delete ──

  describe("delete operation", () => {
    it("deletes an existing record", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [{ id: 1, title: "Delete Me" }]);

      const res = await request(handlers, `${BASE}/tasks/1`, { method: "DELETE" });
      await json(res);

      expect(res.status).toBe(200);
    });

    it("returns 404 for non-existent record", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());

      const res = await request(handlers, `${BASE}/tasks/999`, { method: "DELETE" });
      const body = await json(res);

      expect(res.status).toBe(404);
      expect(body.code).toBe("not_found");
    });
  });

  // ── tree ──

  describe("tree operation", () => {
    function createTreeConfig(): ApiContractConfig {
      return {
        domain: "project",
        basePath: BASE,
        entities: {
          category: {
            schema: z.object({ id: z.string(), name: z.string(), parentId: z.string().nullable() }),
            operations: {
              tree: { method: "GET", path: "/categories/tree" },
            },
          },
        },
      };
    }

    it("returns tree-structured data", async () => {
      const handlers = deriveMockHandlers(createTreeConfig());
      seedEntityStore("project_category", [
        { id: 1, name: "Root", parentId: null, createdAt: "2025-01-01" },
        { id: 2, name: "Child A", parentId: 1, createdAt: "2025-01-02" },
        { id: 3, name: "Child B", parentId: 1, createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/categories/tree`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.data).toBeDefined();
      expect(body.data.data.length).toBeGreaterThanOrEqual(1);
    });

    it("supports rootId filter for subtree", async () => {
      const handlers = deriveMockHandlers(createTreeConfig());
      seedEntityStore("project_category", [
        { id: 1, name: "Root", parentId: null, createdAt: "2025-01-01" },
        { id: 2, name: "Child", parentId: 1, createdAt: "2025-01-02" },
        { id: 3, name: "Unrelated", parentId: null, createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/categories/tree?rootId=1`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.data).toBeDefined();
    });
  });

  // ── custom resolvers ──

  describe("custom resolvers", () => {
    it("uses custom resolver when provided", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              list:    { method: "GET",  path: "/tasks" },
              archive: { method: "POST", path: "/tasks/:id/archive" },
            },
          },
        },
      };

      const handlers = deriveMockHandlers(config, {
        task: {
          resolvers: {
            archive: async ({ params }) => {
              return new Response(JSON.stringify({ archived: true, id: params.id }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            },
          },
        },
      });

      const res = await request(handlers, `${BASE}/tasks/5/archive`, { method: "POST" });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.archived).toBe(true);
      expect(body.id).toBe("5");
    });
  });

  // ── default branch: custom operations ──

  describe("default branch — custom operations", () => {
    it("GET without path param acts as list-like", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              search: { method: "GET", path: "/tasks/search" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [
        { id: 1, title: "A", status: "open", createdAt: "2025-01-01" },
        { id: 2, title: "B", status: "closed", createdAt: "2025-01-02" },
      ]);

      const res = await request(handlers, `${BASE}/tasks/search?status=open`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.data).toHaveLength(1);
    });

    it("GET with path param acts as get-like", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              lookup: { method: "GET", path: "/tasks/lookup/:code" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [{ id: "abc", title: "Found" }]);

      const res = await request(handlers, `${BASE}/tasks/lookup/abc`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.title).toBe("Found");
    });

    it("POST without path param acts as create-like (single)", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              import: { method: "POST", path: "/tasks/import" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);

      const res = await request(handlers, `${BASE}/tasks/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Imported" }),
      });
      const body = await json(res);

      expect(res.status).toBe(201);
      expect(body.data.title).toBe("Imported");
    });

    it("POST without path param handles array body (bulk create)", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              bulkCreate: { method: "POST", path: "/tasks/bulk" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);

      const res = await request(handlers, `${BASE}/tasks/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ title: "Bulk A" }, { title: "Bulk B" }]),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);
    });

    it("PUT without path param acts as create-like", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              replace: { method: "PUT", path: "/tasks/replace" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);

      const res = await request(handlers, `${BASE}/tasks/replace`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Replaced" }),
      });
      const body = await json(res);

      expect(res.status).toBe(201);
      expect(body.data.title).toBe("Replaced");
    });

    it("PATCH with path param acts as update-like", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              activate: { method: "PATCH", path: "/tasks/:id/activate" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [{ id: 1, title: "Task A", active: false }]);

      const res = await request(handlers, `${BASE}/tasks/1/activate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.active).toBe(true);
    });

    it("DELETE with path param acts as delete-like", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              softDelete: { method: "DELETE", path: "/tasks/:id/soft" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [{ id: 1, title: "Delete me" }]);

      const res = await request(handlers, `${BASE}/tasks/1/soft`, { method: "DELETE" });

      expect(res.status).toBe(200);
    });

    it("DELETE without path param falls back to empty success", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              clearAll: { method: "DELETE", path: "/tasks/clear" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);

      const res = await request(handlers, `${BASE}/tasks/clear`, { method: "DELETE" });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data).toBeNull();
    });

    it("POST without path param handles invalid JSON gracefully", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              import: { method: "POST", path: "/tasks/import" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);

      const res = await request(handlers, `${BASE}/tasks/import`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "",
      });
      await json(res);

      // Falls back to {} for invalid JSON
      expect(res.status).toBe(201);
    });

    it("POST with path param handles invalid JSON gracefully", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              activate: { method: "POST", path: "/tasks/:id/activate" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [{ id: 1, title: "Task A" }]);

      const res = await request(handlers, `${BASE}/tasks/1/activate`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "",
      });
      await json(res);

      // Falls back to {} for invalid JSON
      expect(res.status).toBe(200);
    });
  });

  // ── responseWrapper ──

  describe("responseWrapper option", () => {
    const wrapper = {
      success: (data: unknown) => ({ type: "SUCCESS", body: data, ts: "now" }),
      error: (err: { code?: string; message?: string } | undefined) => ({ type: "ERROR", detail: err?.message }),
    };

    it("wraps success response", async () => {
      const handlers = deriveMockHandlers(createBasicConfig(), undefined, {
        responseWrapper: wrapper,
      });
      seedEntityStore("project_task", [{ id: 1, title: "Wrapped", createdAt: "2025-01-01" }]);

      const res = await request(handlers, `${BASE}/tasks/1`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.type).toBe("SUCCESS");
      expect(body.body.title).toBe("Wrapped");
    });

    it("wraps error response", async () => {
      const handlers = deriveMockHandlers(createBasicConfig(), undefined, {
        responseWrapper: wrapper,
      });

      const res = await request(handlers, `${BASE}/tasks/999`);
      const body = await json(res);

      expect(res.status).toBe(404);
      expect(body.type).toBe("ERROR");
      expect(body.detail).toBeDefined();
    });

    it("wraps list success", async () => {
      const handlers = deriveMockHandlers(createBasicConfig(), undefined, {
        responseWrapper: wrapper,
      });

      const res = await request(handlers, `${BASE}/tasks`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.type).toBe("SUCCESS");
    });

    it("wraps fallback empty success", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              clearAll: { method: "DELETE", path: "/tasks/clear" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config, undefined, {
        responseWrapper: wrapper,
      });

      const res = await request(handlers, `${BASE}/tasks/clear`, { method: "DELETE" });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.type).toBe("SUCCESS");
      expect(body.body).toBeNull();
    });
  });

  // ── WiredSchema output ──

  describe("WiredSchema output", () => {
    it("uses wired schema wrap for success response", async () => {
      const dataSchema = z.object({ id: z.number(), title: z.string() });
      const wireSchema = z.object({ type: z.string(), body: dataSchema, ts: z.string() });

      const output = wired(
        wireSchema,
        dataSchema,
        (data) => ({ type: "OK", body: data, ts: "2025-01-01" }),
        (wire) => wire.body,
      );

      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              get: { method: "GET", path: "/tasks/:id", output },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [{ id: 1, title: "Wired" }]);

      const res = await request(handlers, `${BASE}/tasks/1`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.type).toBe("OK");
      expect(body.body.title).toBe("Wired");
    });

    it("uses wired schema wrap for list response", async () => {
      const itemSchema = z.object({ id: z.number(), title: z.string() });
      const listDataSchema = z.object({ data: z.array(itemSchema) });
      const wireSchema = z.object({ type: z.string(), body: listDataSchema });

      const output = wired(
        wireSchema,
        listDataSchema,
        (data) => ({ type: "LIST_OK", body: data }),
        (wire) => wire.body,
      );

      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              list: { method: "GET", path: "/tasks", output },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [
        { id: 1, title: "A", createdAt: "2025-01-01" },
      ]);

      const res = await request(handlers, `${BASE}/tasks`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.type).toBe("LIST_OK");
    });

    it("uses wired schema wrap for fallback empty success", async () => {
      const dataSchema = z.null();
      const wireSchema = z.object({ type: z.string(), body: z.null() });

      const output = wired(
        wireSchema,
        dataSchema,
        () => ({ type: "OK", body: null }),
        (wire) => wire.body,
      );

      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              clearAll: { method: "DELETE", path: "/tasks/clear", output },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);

      const res = await request(handlers, `${BASE}/tasks/clear`, { method: "DELETE" });
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.type).toBe("OK");
    });
  });

  // ── sorting edge cases ──

  describe("sorting edge cases", () => {
    it("handles multi-field sort", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "A", priority: 2, createdAt: "2025-01-01" },
        { id: 2, title: "B", priority: 1, createdAt: "2025-01-02" },
        { id: 3, title: "C", priority: 1, createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?sort=priority:asc,title:desc`);
      const body = await json(res);

      expect(body.data.data[0].title).toBe("C");
      expect(body.data.data[1].title).toBe("B");
      expect(body.data.data[2].title).toBe("A");
    });

    it("handles sort with null values", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "A", sortField: null, createdAt: "2025-01-01" },
        { id: 2, title: "B", sortField: "z", createdAt: "2025-01-02" },
        { id: 3, title: "C", sortField: "a", createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?sort=sortField:asc`);
      const body = await json(res);

      expect(res.status).toBe(200);
      // null values sort first (asc)
      expect(body.data.data[0].sortField).toBeNull();
    });

    it("handles sort with both null values", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "A", rank: null, createdAt: "2025-01-01" },
        { id: 2, title: "B", rank: null, createdAt: "2025-01-02" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?sort=rank:asc`);
      const body = await json(res);

      // Both null — stable order
      expect(body.data.data).toHaveLength(2);
    });

    it("handles sort field without direction defaulting to asc", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "B", createdAt: "2025-01-01" },
        { id: 2, title: "A", createdAt: "2025-01-02" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?sort=title`);
      const body = await json(res);

      expect(body.data.data[0].title).toBe("A");
      expect(body.data.data[1].title).toBe("B");
    });

    it("handles numeric sort (descending)", async () => {
      const handlers = deriveMockHandlers(createBasicConfig());
      seedEntityStore("project_task", [
        { id: 1, title: "A", score: 10, createdAt: "2025-01-01" },
        { id: 2, title: "B", score: 30, createdAt: "2025-01-02" },
        { id: 3, title: "C", score: 20, createdAt: "2025-01-03" },
      ]);

      const res = await request(handlers, `${BASE}/tasks?sort=score:desc`);
      const body = await json(res);

      expect(body.data.data[0].score).toBe(30);
      expect(body.data.data[1].score).toBe(20);
      expect(body.data.data[2].score).toBe(10);
    });
  });

  // ── operation path sort order ──

  describe("operation path sort order", () => {
    it("static paths are registered before parameterized paths", async () => {
      const config: ApiContractConfig = {
        domain: "project",
        basePath: BASE,
        entities: {
          task: {
            schema: taskSchema,
            operations: {
              get:  { method: "GET", path: "/tasks/:id" },
              tree: { method: "GET", path: "/tasks/tree" },
            },
          },
        },
      };
      const handlers = deriveMockHandlers(config);
      seedEntityStore("project_task", [
        { id: 1, name: "Root", parentId: null, createdAt: "2025-01-01" },
      ]);

      const res = await request(handlers, `${BASE}/tasks/tree`);
      const body = await json(res);

      expect(res.status).toBe(200);
      expect(body.data.data).toBeDefined();
    });
  });
});
