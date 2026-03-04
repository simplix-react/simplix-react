import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { deriveClient } from "../derive/client.js";

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

const baseConfig = {
  domain: "project",
  basePath: "/api/v1",
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

describe("deriveClient entity CRUD", () => {
  it("calls list with correct URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(baseConfig, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.list();
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks");
  });

  it("calls get with correct URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ id: "1" });
    const client = deriveClient(baseConfig, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.get("task-1");
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks/task-1");
  });

  it("calls create with POST method and body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ id: "new" });
    const client = deriveClient(baseConfig, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.create({ title: "New Task" });
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "New Task" }),
    });
  });

  it("calls update with PATCH method and body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ id: "1" });
    const client = deriveClient(baseConfig, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.update("task-1", { title: "Updated Title" });
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks/task-1", {
      method: "PATCH",
      body: JSON.stringify({ title: "Updated Title" }),
    });
  });

  it("calls delete with DELETE method", async () => {
    const mockFetch = vi.fn().mockResolvedValue(undefined);
    const client = deriveClient(baseConfig, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.delete("task-1");
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks/task-1", {
      method: "DELETE",
    });
  });
});

describe("deriveClient with parent entity", () => {
  const configWithParent = {
    domain: "project",
    basePath: "/api/v1",
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
        parent: { param: "projectId", path: "/projects" },
      },
    },
  };

  it("builds parent-scoped list URL with parentId", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(configWithParent, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.list("proj-1");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/projects/proj-1/tasks",
    );
  });

  it("builds parent-scoped create URL with parentId", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ id: "new" });
    const client = deriveClient(configWithParent, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.create("proj-1", { title: "Sub Task" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/projects/proj-1/tasks",
      {
        method: "POST",
        body: JSON.stringify({ title: "Sub Task" }),
      },
    );
  });

  it("falls back to base path when no parentId provided for list", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(configWithParent, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.list();
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks");
  });

  it("falls back to base path when list params are object (not parentId)", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(
      { ...configWithParent, queryBuilder: simpleQueryBuilder },
      mockFetch,
    );
    const taskClient = client.task as EntityClientShape;

    await taskClient.list({ filters: { status: "active" } });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/tasks?status=active",
    );
  });
});

describe("deriveClient with top-level operations", () => {
  const configWithOps = {
    domain: "project",
    basePath: "/api/v1",
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
    operations: {
      assignTask: {
        method: "POST" as const,
        path: "/tasks/:taskId/assign",
        input: z.object({ userId: z.string() }),
        output: z.object({ id: z.string(), assigneeId: z.string() }),
      },
    },
  };

  it("creates operation client with path param substitution", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ id: "1", assigneeId: "user-1" });
    const client = deriveClient(configWithOps, mockFetch);
    const assignTask = client.assignTask as (...args: unknown[]) => Promise<unknown>;

    await assignTask("task-1", { userId: "user-1" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/tasks/task-1/assign",
      {
        method: "POST",
        body: JSON.stringify({ userId: "user-1" }),
      },
    );
  });

  it("handles GET operation without body", async () => {
    const configWithGetOp = {
      ...configWithOps,
      operations: {
        getTaskStatus: {
          method: "GET" as const,
          path: "/tasks/:taskId/status",
          input: z.object({}),
          output: z.object({ status: z.string() }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ status: "active" });
    const client = deriveClient(configWithGetOp, mockFetch);
    const getTaskStatus = client.getTaskStatus as (...args: unknown[]) => Promise<unknown>;

    await getTaskStatus("task-1");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/tasks/task-1/status",
      { method: "GET" },
    );
  });

  it("handles operation with multiple path params", async () => {
    const configWithMultiParams = {
      ...configWithOps,
      operations: {
        reassignTask: {
          method: "POST" as const,
          path: "/projects/:projectId/tasks/:taskId/reassign",
          input: z.object({ newUserId: z.string() }),
          output: z.object({ success: z.boolean() }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ success: true });
    const client = deriveClient(configWithMultiParams, mockFetch);
    const reassign = client.reassignTask as (...args: unknown[]) => Promise<unknown>;

    await reassign("proj-1", "task-1", { newUserId: "user-2" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/projects/proj-1/tasks/task-1/reassign",
      {
        method: "POST",
        body: JSON.stringify({ newUserId: "user-2" }),
      },
    );
  });

  it("handles operation without path params", async () => {
    const configNoParams = {
      ...configWithOps,
      operations: {
        healthCheck: {
          method: "GET" as const,
          path: "/health",
          input: z.object({}),
          output: z.object({ status: z.string() }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ status: "ok" });
    const client = deriveClient(configNoParams, mockFetch);
    const healthCheck = client.healthCheck as (...args: unknown[]) => Promise<unknown>;

    await healthCheck();
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/health", {
      method: "GET",
    });
  });
});

describe("deriveClient with custom entity operations", () => {
  it("handles PUT method entity", async () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            update: { method: "PUT" as const, path: "/tasks/:id", input: updateTaskDto },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ id: "1" });
    const client = deriveClient(config, mockFetch);
    const taskClient = client.task as { update: (id: string, dto: unknown) => Promise<unknown> };

    await taskClient.update("task-1", { title: "Updated" });
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks/task-1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });
  });

  it("entity without delete operation has no delete method", () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            list: { method: "GET" as const, path: "/tasks" },
            get:  { method: "GET" as const, path: "/tasks/:id" },
          },
        },
      },
    };

    const mockFetch = vi.fn();
    const client = deriveClient(config, mockFetch);
    const taskClient = client.task as Record<string, unknown>;

    expect(taskClient.list).toBeDefined();
    expect(taskClient.get).toBeDefined();
    expect(taskClient.delete).toBeUndefined();
  });

  it("handles custom archive operation", async () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            archive: { method: "POST" as const, path: "/tasks/:id/archive", input: z.object({ reason: z.string() }) },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ success: true });
    const client = deriveClient(config, mockFetch);
    const taskClient = client.task as { archive: (...args: unknown[]) => Promise<unknown> };

    await taskClient.archive("task-1", { reason: "completed" });
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks/task-1/archive", {
      method: "POST",
      body: JSON.stringify({ reason: "completed" }),
    });
  });

  it("handles bulkDelete operation", async () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            bulkDelete: {
              method: "POST" as const,
              path: "/tasks/bulk-delete",
              input: z.object({ ids: z.array(z.string()) }),
            },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ success: true });
    const client = deriveClient(config, mockFetch);
    const taskClient = client.task as { bulkDelete: (...args: unknown[]) => Promise<unknown> };

    await taskClient.bulkDelete({ ids: ["1", "2", "3"] });
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: ["1", "2", "3"] }),
    });
  });

  it("handles tree operation", async () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        category: {
          schema: z.object({ id: z.string(), name: z.string(), parentId: z.string().nullable() }),
          operations: {
            tree: { method: "GET" as const, path: "/categories/tree" },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(config, mockFetch);
    const categoryClient = client.category as { tree: (params?: Record<string, unknown>) => Promise<unknown> };

    await categoryClient.tree();
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/categories/tree");
  });

  it("handles tree operation with rootId param", async () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        category: {
          schema: z.object({ id: z.string(), name: z.string(), parentId: z.string().nullable() }),
          operations: {
            tree: { method: "GET" as const, path: "/categories/tree" },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(config, mockFetch);
    const categoryClient = client.category as { tree: (params?: Record<string, unknown>) => Promise<unknown> };

    await categoryClient.tree({ rootId: "abc" });
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/categories/tree?rootId=abc");
  });

  it("handles explicit role mapping", async () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            fetchAll: { method: "GET" as const, path: "/tasks", role: "list" as const },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(config, mockFetch);
    const taskClient = client.task as { fetchAll: (params?: ListParams) => Promise<unknown> };

    await taskClient.fetchAll();
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks");
  });
});

describe("deriveClient with multiple entities", () => {
  const projectSchema = z.object({ id: z.string(), name: z.string() });
  const createProjectDto = z.object({ name: z.string() });
  const updateProjectDto = z.object({ name: z.string().optional() });

  const multiConfig = {
    domain: "app",
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
      project: {
        schema: projectSchema,
        operations: {
          list:   { method: "GET" as const,    path: "/projects" },
          get:    { method: "GET" as const,    path: "/projects/:id" },
          create: { method: "POST" as const,   path: "/projects", input: createProjectDto },
          update: { method: "PATCH" as const,  path: "/projects/:id", input: updateProjectDto },
          delete: { method: "DELETE" as const, path: "/projects/:id" },
        },
      },
    },
  };

  it("generates clients for all entities", () => {
    const mockFetch = vi.fn();
    const client = deriveClient(multiConfig, mockFetch);
    expect(client.task).toBeDefined();
    expect(client.project).toBeDefined();
  });

  it("each entity client has CRUD methods", () => {
    const mockFetch = vi.fn();
    const client = deriveClient(multiConfig, mockFetch);
    const taskClient = client.task as EntityClientShape;
    const projectClient = client.project as EntityClientShape;

    expect(typeof taskClient.list).toBe("function");
    expect(typeof taskClient.get).toBe("function");
    expect(typeof taskClient.create).toBe("function");
    expect(typeof taskClient.update).toBe("function");
    expect(typeof taskClient.delete).toBe("function");

    expect(typeof projectClient.list).toBe("function");
    expect(typeof projectClient.get).toBe("function");
    expect(typeof projectClient.create).toBe("function");
    expect(typeof projectClient.update).toBe("function");
    expect(typeof projectClient.delete).toBe("function");
  });
});

describe("deriveClient with queryBuilder", () => {
  const configWithQB = {
    ...baseConfig,
    queryBuilder: simpleQueryBuilder,
  };

  it("appends query params to list URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(configWithQB, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.list({
      filters: { status: "pending" },
      pagination: { type: "offset", page: 1, limit: 10 },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/tasks?status=pending&page=1&limit=10",
    );
  });

  it("does not append query string when params produce empty search params", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const client = deriveClient(configWithQB, mockFetch);
    const taskClient = client.task as EntityClientShape;

    await taskClient.list({});
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks");
  });
});

describe("deriveClient with transformRequest", () => {
  it("sends Basic Auth header via transformRequest (top-level operation)", async () => {
    const config = {
      domain: "auth",
      basePath: "/api/v1",
      entities: {},
      operations: {
        issueToken: {
          method: "POST" as const,
          path: "/auth/token/issue",
          input: z.object({ username: z.string(), password: z.string() }),
          output: z.object({ accessToken: z.string() }),
          transformRequest: (input: unknown) => ({
            headers: {
              Authorization: `Basic ${btoa(`${(input as { username: string; password: string }).username}:${(input as { username: string; password: string }).password}`)}`,
            },
          }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ accessToken: "abc" });
    const client = deriveClient(config, mockFetch);
    const issueToken = client.issueToken as (...args: unknown[]) => Promise<unknown>;

    await issueToken({ username: "admin", password: "secret" });
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/auth/token/issue", {
      method: "POST",
      headers: { Authorization: `Basic ${btoa("admin:secret")}` },
    });
  });

  it("sends form-encoded body via transformRequest", async () => {
    const config = {
      domain: "auth",
      basePath: "/api",
      entities: {},
      operations: {
        login: {
          method: "POST" as const,
          path: "/login",
          input: z.object({ username: z.string(), password: z.string() }),
          output: z.object({ token: z.string() }),
          transformRequest: (input: unknown) => ({
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(input as Record<string, string>).toString(),
          }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ token: "xyz" });
    const client = deriveClient(config, mockFetch);
    const login = client.login as (...args: unknown[]) => Promise<unknown>;

    await login({ username: "user", password: "pass" });
    expect(mockFetch).toHaveBeenCalledWith("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "username=user&password=pass",
    });
  });

  it("overrides URL via transformRequest (query params)", async () => {
    const config = {
      domain: "search",
      basePath: "/api",
      entities: {},
      operations: {
        search: {
          method: "GET" as const,
          path: "/search",
          input: z.object({ q: z.string() }),
          output: z.object({ results: z.array(z.string()) }),
          transformRequest: (input: unknown, url: string) => ({
            url: `${url}?${new URLSearchParams(input as Record<string, string>).toString()}`,
          }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ results: [] });
    const client = deriveClient(config, mockFetch);
    const search = client.search as (...args: unknown[]) => Promise<unknown>;

    await search({ q: "hello" });
    expect(mockFetch).toHaveBeenCalledWith("/api/search?q=hello", {
      method: "GET",
    });
  });

  it("applies transformRequest on entity generic operations", async () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            customAction: {
              method: "POST" as const,
              path: "/tasks/:id/custom",
              input: z.object({ data: z.string() }),
              transformRequest: (input: unknown) => ({
                headers: { "X-Custom": "true" },
                body: JSON.stringify(input),
              }),
            },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    const client = deriveClient(config, mockFetch);
    const taskClient = client.task as { customAction: (...args: unknown[]) => Promise<unknown> };

    await taskClient.customAction("task-1", { data: "value" });
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/tasks/task-1/custom", {
      method: "POST",
      headers: { "X-Custom": "true" },
      body: JSON.stringify({ data: "value" }),
    });
  });
});

describe("deriveClient with transformResponse", () => {
  it("applies transformResponse to top-level operation", async () => {
    const config = {
      domain: "auth",
      basePath: "/api",
      entities: {},
      operations: {
        getToken: {
          method: "POST" as const,
          path: "/token",
          input: z.object({}),
          output: z.object({ accessToken: z.string(), accessTokenExpiry: z.string() }),
          transformResponse: (raw: unknown) => ({
            token: (raw as { accessToken: string }).accessToken,
            expiresAt: (raw as { accessTokenExpiry: string }).accessTokenExpiry,
          }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      accessToken: "abc",
      accessTokenExpiry: "2026-01-01",
    });
    const client = deriveClient(config, mockFetch);
    const getToken = client.getToken as (...args: unknown[]) => Promise<unknown>;

    const result = await getToken({});
    expect(result).toEqual({ token: "abc", expiresAt: "2026-01-01" });
  });

  it("applies transformResponse without transformRequest (default request)", async () => {
    const config = {
      domain: "auth",
      basePath: "/api",
      entities: {},
      operations: {
        refresh: {
          method: "POST" as const,
          path: "/token/refresh",
          input: z.object({}),
          output: z.object({ accessToken: z.string(), refreshToken: z.string() }),
          transformResponse: (raw: unknown) => ({
            access: (raw as { accessToken: string }).accessToken,
            refresh: (raw as { refreshToken: string }).refreshToken,
          }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    const client = deriveClient(config, mockFetch);
    const refresh = client.refresh as (...args: unknown[]) => Promise<unknown>;

    const result = await refresh({});
    expect(result).toEqual({ access: "new-access", refresh: "new-refresh" });
  });

  it("applies both transformRequest and transformResponse together", async () => {
    const config = {
      domain: "auth",
      basePath: "/api",
      entities: {},
      operations: {
        login: {
          method: "POST" as const,
          path: "/login",
          input: z.object({ user: z.string(), pass: z.string() }),
          output: z.object({ accessToken: z.string(), accessTokenExpiry: z.string() }),
          transformRequest: (input: unknown) => ({
            headers: {
              Authorization: `Basic ${btoa(`${(input as { user: string }).user}:${(input as { pass: string }).pass}`)}`,
            },
          }),
          transformResponse: (raw: unknown) => ({
            token: (raw as { accessToken: string }).accessToken,
            expiresAt: (raw as { accessTokenExpiry: string }).accessTokenExpiry,
          }),
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      accessToken: "tok",
      accessTokenExpiry: "2026-12-31",
    });
    const client = deriveClient(config, mockFetch);
    const login = client.login as (...args: unknown[]) => Promise<unknown>;

    const result = await login({ user: "admin", pass: "pw" });

    expect(mockFetch).toHaveBeenCalledWith("/api/login", {
      method: "POST",
      headers: { Authorization: `Basic ${btoa("admin:pw")}` },
    });
    expect(result).toEqual({ token: "tok", expiresAt: "2026-12-31" });
  });

  it("applies transformResponse on entity generic operations", async () => {
    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            status: {
              method: "GET" as const,
              path: "/tasks/:id/status",
              output: z.object({ statusCode: z.number(), statusName: z.string() }),
              transformResponse: (raw: unknown) => ({
                code: (raw as { statusCode: number }).statusCode,
                name: (raw as { statusName: string }).statusName,
              }),
            },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ statusCode: 1, statusName: "active" });
    const client = deriveClient(config, mockFetch);
    const taskClient = client.task as { status: (...args: unknown[]) => Promise<unknown> };

    const result = await taskClient.status("task-1");
    expect(result).toEqual({ code: 1, name: "active" });
  });
});
