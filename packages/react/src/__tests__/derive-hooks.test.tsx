// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";
import { z } from "zod";
import { deriveHooks } from "../derive-hooks.js";
import type { EntityId, QueryKeyFactory } from "@simplix-react/contract";

// ── Schemas ──

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
});

const createTaskDto = z.object({ title: z.string() });
const updateTaskDto = z.object({ title: z.string().optional(), status: z.string().optional() });

// ── Mock Helpers ──

function createMockClient() {
  return {
    task: {
      list: vi.fn().mockResolvedValue([
        { id: "1", title: "Task 1", status: "open" },
        { id: "2", title: "Task 2", status: "done" },
      ]),
      get: vi.fn().mockResolvedValue({ id: "1", title: "Task 1", status: "open" }),
      create: vi.fn().mockResolvedValue({ id: "3", title: "New Task", status: "open" }),
      update: vi.fn().mockResolvedValue({ id: "1", title: "Updated", status: "done" }),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  };
}

function createMockQueryKeys(): Record<string, QueryKeyFactory> {
  return {
    task: {
      all: ["test", "task"] as const,
      lists: () => ["test", "task", "list"] as const,
      list: (params: Record<string, unknown>) => ["test", "task", "list", params] as const,
      details: () => ["test", "task", "detail"] as const,
      detail: (id: EntityId) => ["test", "task", "detail", id] as const,
      trees: () => ["test", "task", "tree"] as const,
      tree: (params?: Record<string, unknown>) => params ? ["test", "task", "tree", params] as const : ["test", "task", "tree"] as const,
    },
  };
}

function createMockContract(clientOverride?: ReturnType<typeof createMockClient>) {
  const client = clientOverride ?? createMockClient();
  return {
    config: {
      domain: "test",
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
    client,
    queryKeys: createMockQueryKeys(),
  };
}

function createMockContractWithParent(clientOverride?: ReturnType<typeof createMockClient>) {
  const client = clientOverride ?? createMockClient();
  return {
    config: {
      domain: "test",
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
          parent: { param: "projectId", path: "/projects" },
        },
      },
    },
    client,
    queryKeys: createMockQueryKeys(),
  };
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

// ── Tests ──

describe("deriveHooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  // ── Structure ──

  describe("hook structure", () => {
    it("returns entity hooks for each entity in the contract", () => {
      const contract = createMockContract();
      const hooks = deriveHooks(contract);

      expect(hooks).toHaveProperty("task");
      expect(hooks.task).toHaveProperty("useList");
      expect(hooks.task).toHaveProperty("useGet");
      expect(hooks.task).toHaveProperty("useCreate");
      expect(hooks.task).toHaveProperty("useUpdate");
      expect(hooks.task).toHaveProperty("useDelete");
      expect(hooks.task).toHaveProperty("useInfiniteList");
    });

    it("returns operation hooks when operations are defined", () => {
      const opClient = vi.fn().mockResolvedValue({ result: "ok" });
      const contract = {
        config: {
          domain: "test",
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
          operations: {
            archiveTask: {
              method: "POST" as const,
              path: "/tasks/:id/archive",
              input: z.object({ id: z.string() }),
              output: z.object({ result: z.string() }),
            },
          },
        },
        client: {
          ...createMockClient(),
          archiveTask: opClient,
        },
        queryKeys: createMockQueryKeys(),
      };

      const hooks = deriveHooks(contract);

      expect(hooks).toHaveProperty("archiveTask");
      expect(hooks.archiveTask).toHaveProperty("useMutation");
    });
  });

  // ── useList ──

  describe("useList", () => {
    it("fetches a list of entities", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useList(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([
        { id: "1", title: "Task 1", status: "open" },
        { id: "2", title: "Task 2", status: "done" },
      ]);
      expect(client.task.list).toHaveBeenCalled();
    });

    it("passes list params (filters, sort, pagination)", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const listParams = {
        filters: { status: "open" },
        sort: { field: "title", direction: "asc" as const },
      };

      renderHook(() => hooks.task.useList(listParams), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(client.task.list).toHaveBeenCalledWith(listParams));
    });

    it("passes parentId for child entities", async () => {
      const client = createMockClient();
      const contract = createMockContractWithParent(client);
      const hooks = deriveHooks(contract);

      renderHook(() => hooks.task.useList("parent-1"), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() =>
        expect(client.task.list).toHaveBeenCalledWith("parent-1", undefined),
      );
    });

    it("passes parentId with list params for child entities", async () => {
      const client = createMockClient();
      const contract = createMockContractWithParent(client);
      const hooks = deriveHooks(contract);

      const listParams = { filters: { status: "open" } };

      renderHook(() => hooks.task.useList("parent-1", listParams), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() =>
        expect(client.task.list).toHaveBeenCalledWith("parent-1", listParams),
      );
    });

    it("is disabled when parent entity has no parentId", async () => {
      const client = createMockClient();
      const contract = createMockContractWithParent(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useList(undefined as unknown as string), {
        wrapper: createWrapper(queryClient),
      });

      // Should stay in pending status since enabled=false
      expect(result.current.fetchStatus).toBe("idle");
      expect(client.task.list).not.toHaveBeenCalled();
    });

    it("merges custom query options", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(
        () => hooks.task.useList({ enabled: false }),
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(client.task.list).not.toHaveBeenCalled();
    });
  });

  // ── useGet ──

  describe("useGet", () => {
    it("fetches a single entity by ID", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useGet("1"), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ id: "1", title: "Task 1", status: "open" });
      expect(client.task.get).toHaveBeenCalledWith("1");
    });

    it("is disabled when id is empty string", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useGet(""), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(client.task.get).not.toHaveBeenCalled();
    });

    it("merges custom query options", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(
        () => hooks.task.useGet("1", { enabled: false }),
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(client.task.get).not.toHaveBeenCalled();
    });

    it("fetches a single entity by composite key", async () => {
      const client = createMockClient();
      const compositeId = { tenantId: "t1", taskId: "1" };
      client.task.get.mockResolvedValue({ tenantId: "t1", taskId: "1", title: "Task 1", status: "open" });
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useGet(compositeId), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.get).toHaveBeenCalledWith(compositeId);
    });
  });

  // ── useCreate ──

  describe("useCreate", () => {
    it("creates an entity and invalidates cache", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => hooks.task.useCreate(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ title: "New Task" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.create).toHaveBeenCalledWith({ title: "New Task" });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["test", "task"],
      });
    });

    it("passes parentId for child entities", async () => {
      const client = createMockClient();
      const contract = createMockContractWithParent(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useCreate("parent-1"), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ title: "Child Task" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.create).toHaveBeenCalledWith("parent-1", { title: "Child Task" });
    });

    it("calls user-provided onSuccess callback", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);
      const onSuccess = vi.fn();

      const { result } = renderHook(
        () => hooks.task.useCreate(undefined, { onSuccess }),
        { wrapper: createWrapper(queryClient) },
      );

      await act(async () => {
        result.current.mutate({ title: "New Task" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  // ── useUpdate ──

  describe("useUpdate", () => {
    it("updates an entity and invalidates cache on settled", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => hooks.task.useUpdate(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: "1", dto: { title: "Updated" } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.update).toHaveBeenCalledWith("1", { title: "Updated" });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["test", "task"],
      });
    });

    it("calls user-provided onSuccess callback", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);
      const onSuccess = vi.fn();

      const { result } = renderHook(
        () => hooks.task.useUpdate({ onSuccess }),
        { wrapper: createWrapper(queryClient) },
      );

      await act(async () => {
        result.current.mutate({ id: "1", dto: { status: "done" } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalled();
    });

    it("supports optimistic updates", async () => {
      const client = createMockClient();
      // Make update slightly delayed to observe optimistic update
      client.task.update.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: "1", title: "Server Updated", status: "done" }), 50)),
      );
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      // Pre-populate cache with list data
      queryClient.setQueryData(["test", "task", "list", {}], [
        { id: "1", title: "Task 1", status: "open" },
        { id: "2", title: "Task 2", status: "done" },
      ]);

      const { result } = renderHook(
        () => hooks.task.useUpdate({ optimistic: true } as never),
        { wrapper: createWrapper(queryClient) },
      );

      await act(async () => {
        result.current.mutate({ id: "1", dto: { title: "Optimistic Update" } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.update).toHaveBeenCalledWith("1", { title: "Optimistic Update" });
    });

    it("rolls back optimistic update on error", async () => {
      const client = createMockClient();
      client.task.update.mockRejectedValue(new Error("Server error"));
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const originalData = [
        { id: "1", title: "Task 1", status: "open" },
        { id: "2", title: "Task 2", status: "done" },
      ];

      // Pre-populate cache
      queryClient.setQueryData(["test", "task", "list", {}], originalData);

      const { result } = renderHook(
        () => hooks.task.useUpdate({ optimistic: true } as never),
        { wrapper: createWrapper(queryClient) },
      );

      await act(async () => {
        result.current.mutate({ id: "1", dto: { title: "Will Fail" } });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Cache should be rolled back to original data
      const cachedData = queryClient.getQueryData(["test", "task", "list", {}]);
      expect(cachedData).toEqual(originalData);
    });

    it("updates an entity with composite key", async () => {
      const client = createMockClient();
      const compositeId = { tenantId: "t1", taskId: "1" };
      client.task.update.mockResolvedValue({ tenantId: "t1", taskId: "1", title: "Updated", status: "done" });
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useUpdate(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: compositeId, dto: { title: "Updated" } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.update).toHaveBeenCalledWith(compositeId, { title: "Updated" });
    });

    it("supports optimistic updates with composite key", async () => {
      const client = createMockClient();
      const compositeId = { tenantId: "t1", taskId: "1" };
      client.task.update.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ tenantId: "t1", taskId: "1", title: "Server Updated", status: "done" }), 50)),
      );
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      queryClient.setQueryData(["test", "task", "list", {}], [
        { tenantId: "t1", taskId: "1", title: "Task 1", status: "open" },
        { tenantId: "t1", taskId: "2", title: "Task 2", status: "done" },
      ]);

      const { result } = renderHook(
        () => hooks.task.useUpdate({ optimistic: true } as never),
        { wrapper: createWrapper(queryClient) },
      );

      await act(async () => {
        result.current.mutate({ id: compositeId, dto: { title: "Optimistic Update" } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.update).toHaveBeenCalledWith(compositeId, { title: "Optimistic Update" });
    });
  });

  // ── useDelete ──

  describe("useDelete", () => {
    it("deletes an entity and invalidates cache", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => hooks.task.useDelete(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate("1");
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.delete).toHaveBeenCalledWith("1");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["test", "task"],
      });
    });

    it("calls user-provided onSuccess callback", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);
      const onSuccess = vi.fn();

      const { result } = renderHook(
        () => hooks.task.useDelete({ onSuccess }),
        { wrapper: createWrapper(queryClient) },
      );

      await act(async () => {
        result.current.mutate("1");
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalled();
    });

    it("deletes an entity with composite key", async () => {
      const client = createMockClient();
      const compositeId = { tenantId: "t1", taskId: "1" };
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useDelete(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate(compositeId);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(client.task.delete).toHaveBeenCalledWith(compositeId);
    });
  });

  // ── useInfiniteList ──

  describe("useInfiniteList", () => {
    it("fetches first page of infinite list", async () => {
      const client = createMockClient();
      client.task.list.mockResolvedValue({
        data: [{ id: "1", title: "Task 1", status: "open" }],
        meta: { hasNextPage: true, nextCursor: "cursor-1" },
      });
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(
        () => hooks.task.useInfiniteList(),
        { wrapper: createWrapper(queryClient) },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages).toHaveLength(1);
      expect(client.task.list).toHaveBeenCalled();
    });

    it("determines hasNextPage from response meta", async () => {
      const client = createMockClient();
      client.task.list.mockResolvedValue({
        data: [{ id: "1", title: "Task 1", status: "open" }],
        meta: { hasNextPage: true, nextCursor: "cursor-1" },
      });
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(
        () => hooks.task.useInfiniteList(),
        { wrapper: createWrapper(queryClient) },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.hasNextPage).toBe(true);
    });

    it("reports no next page when meta says so", async () => {
      const client = createMockClient();
      client.task.list.mockResolvedValue({
        data: [{ id: "1", title: "Task 1", status: "open" }],
        meta: { hasNextPage: false },
      });
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(
        () => hooks.task.useInfiniteList(),
        { wrapper: createWrapper(queryClient) },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.hasNextPage).toBe(false);
    });

    it("passes parentId for child entities", async () => {
      const client = createMockClient();
      client.task.list.mockResolvedValue({
        data: [],
        meta: { hasNextPage: false },
      });
      const contract = createMockContractWithParent(client);
      const hooks = deriveHooks(contract);

      renderHook(
        () => hooks.task.useInfiniteList("parent-1"),
        { wrapper: createWrapper(queryClient) },
      );

      await waitFor(() =>
        expect(client.task.list).toHaveBeenCalledWith(
          "parent-1",
          expect.objectContaining({
            pagination: expect.objectContaining({ type: "offset", page: 1, limit: 20 }),
          }),
        ),
      );
    });

    it("is disabled when parent entity has no parentId", async () => {
      const client = createMockClient();
      const contract = createMockContractWithParent(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(
        () => hooks.task.useInfiniteList(undefined),
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(client.task.list).not.toHaveBeenCalled();
    });

    it("uses custom limit parameter", async () => {
      const client = createMockClient();
      client.task.list.mockResolvedValue({
        data: [],
        meta: { hasNextPage: false },
      });
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      renderHook(
        () => hooks.task.useInfiniteList(undefined, { limit: 50 }),
        { wrapper: createWrapper(queryClient) },
      );

      await waitFor(() =>
        expect(client.task.list).toHaveBeenCalledWith(
          expect.objectContaining({
            pagination: expect.objectContaining({ limit: 50 }),
          }),
        ),
      );
    });

    it("passes filters and sort to the list client", async () => {
      const client = createMockClient();
      client.task.list.mockResolvedValue({
        data: [],
        meta: { hasNextPage: false },
      });
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const params = {
        filters: { status: "open" },
        sort: { field: "title", direction: "asc" as const },
      };

      renderHook(
        () => hooks.task.useInfiniteList(undefined, params),
        { wrapper: createWrapper(queryClient) },
      );

      await waitFor(() =>
        expect(client.task.list).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: { status: "open" },
            sort: { field: "title", direction: "asc" },
          }),
        ),
      );
    });
  });

  // ── Query Keys ──

  describe("query key structure", () => {
    it("uses correct query keys for useList", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      renderHook(() => hooks.task.useList(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(client.task.list).toHaveBeenCalled());

      // Verify the query was cached with the expected key structure
      const queries = queryClient.getQueryCache().findAll({
        queryKey: ["test", "task", "list"],
      });
      expect(queries.length).toBeGreaterThan(0);
    });

    it("uses correct query keys for useGet", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      renderHook(() => hooks.task.useGet("abc"), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(client.task.get).toHaveBeenCalled());

      const queries = queryClient.getQueryCache().findAll({
        queryKey: ["test", "task", "detail", "abc"],
      });
      expect(queries.length).toBe(1);
    });

    it("includes filter params in list query key", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const listParams = { filters: { status: "open" } };

      renderHook(() => hooks.task.useList(listParams), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(client.task.list).toHaveBeenCalled());

      // findAll with partial key prefix, then check that the params are in the key
      const queries = queryClient.getQueryCache().findAll({
        queryKey: ["test", "task", "list"],
      });
      expect(queries.length).toBeGreaterThan(0);

      const queryKey = queries[0].queryKey;
      expect(queryKey).toEqual(
        ["test", "task", "list", expect.objectContaining({ filters: { status: "open" } })],
      );
    });
  });

  // ── Cache Invalidation ──

  describe("cache invalidation", () => {
    it("invalidates list cache after create mutation", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      // Pre-populate list cache
      queryClient.setQueryData(["test", "task", "list", {}], [
        { id: "1", title: "Task 1", status: "open" },
      ]);

      const { result } = renderHook(() => hooks.task.useCreate(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ title: "New Task" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // The list query should be invalidated (marked as stale)
      const listQuery = queryClient.getQueryCache().find({
        queryKey: ["test", "task", "list", {}],
      });
      expect(listQuery?.isStale()).toBe(true);
    });

    it("invalidates all entity queries after delete mutation", async () => {
      const client = createMockClient();
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      // Pre-populate both list and detail cache
      queryClient.setQueryData(["test", "task", "list", {}], [
        { id: "1", title: "Task 1", status: "open" },
      ]);
      queryClient.setQueryData(["test", "task", "detail", "1"], {
        id: "1", title: "Task 1", status: "open",
      });

      const { result } = renderHook(() => hooks.task.useDelete(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate("1");
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Both should be stale
      const listQuery = queryClient.getQueryCache().find({
        queryKey: ["test", "task", "list", {}],
      });
      const detailQuery = queryClient.getQueryCache().find({
        queryKey: ["test", "task", "detail", "1"],
      });
      expect(listQuery?.isStale()).toBe(true);
      expect(detailQuery?.isStale()).toBe(true);
    });
  });

  // ── Error Handling ──

  describe("error handling", () => {
    it("propagates list fetch errors", async () => {
      const client = createMockClient();
      client.task.list.mockRejectedValue(new Error("Network error"));
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useList(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Network error");
    });

    it("propagates get fetch errors", async () => {
      const client = createMockClient();
      client.task.get.mockRejectedValue(new Error("Not found"));
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useGet("999"), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Not found");
    });

    it("propagates create mutation errors", async () => {
      const client = createMockClient();
      client.task.create.mockRejectedValue(new Error("Validation failed"));
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useCreate(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ title: "" });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Validation failed");
    });

    it("propagates update mutation errors", async () => {
      const client = createMockClient();
      client.task.update.mockRejectedValue(new Error("Conflict"));
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useUpdate(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: "1", dto: { title: "Fail" } });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Conflict");
    });

    it("propagates delete mutation errors", async () => {
      const client = createMockClient();
      client.task.delete.mockRejectedValue(new Error("Forbidden"));
      const contract = createMockContract(client);
      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.task.useDelete(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate("1");
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Forbidden");
    });
  });

  // ── Operation Hooks ──

  describe("operation hooks", () => {
    it("executes mutation and returns result", async () => {
      const opClient = vi.fn().mockResolvedValue({ result: "archived" });
      const contract = {
        config: {
          domain: "test",
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
          operations: {
            archiveTask: {
              method: "POST" as const,
              path: "/tasks/:id/archive",
              input: z.object({ id: z.string() }),
              output: z.object({ result: z.string() }),
            },
          },
        },
        client: {
          ...createMockClient(),
          archiveTask: opClient,
        },
        queryKeys: createMockQueryKeys(),
      };

      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.archiveTask.useMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: "task-1" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(opClient).toHaveBeenCalledWith({ id: "task-1" });
      expect(result.current.data).toEqual({ result: "archived" });
    });

    it("invalidates specified query keys on success", async () => {
      const opClient = vi.fn().mockResolvedValue({ result: "ok" });
      const mockQueryKeys = createMockQueryKeys();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const contract = {
        config: {
          domain: "test",
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
          operations: {
            archiveTask: {
              method: "POST" as const,
              path: "/tasks/:id/archive",
              input: z.object({ id: z.string() }),
              output: z.object({ result: z.string() }),
              invalidates: (queryKeys: Record<string, QueryKeyFactory>) => [
                queryKeys.task.lists(),
              ],
            },
          },
        },
        client: {
          ...createMockClient(),
          archiveTask: opClient,
        },
        queryKeys: mockQueryKeys,
      };

      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.archiveTask.useMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: "task-1" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["test", "task", "list"],
      });
    });

    it("calls user-provided onSuccess callback", async () => {
      const opClient = vi.fn().mockResolvedValue({ result: "ok" });
      const onSuccess = vi.fn();

      const contract = {
        config: {
          domain: "test",
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
          operations: {
            archiveTask: {
              method: "POST" as const,
              path: "/tasks/:id/archive",
              input: z.object({ id: z.string() }),
              output: z.object({ result: z.string() }),
            },
          },
        },
        client: {
          ...createMockClient(),
          archiveTask: opClient,
        },
        queryKeys: createMockQueryKeys(),
      };

      const hooks = deriveHooks(contract);

      const { result } = renderHook(
        () => hooks.archiveTask.useMutation({ onSuccess }),
        { wrapper: createWrapper(queryClient) },
      );

      await act(async () => {
        result.current.mutate({ id: "task-1" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalled();
    });

    it("propagates operation errors", async () => {
      const opClient = vi.fn().mockRejectedValue(new Error("Operation failed"));

      const contract = {
        config: {
          domain: "test",
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
          operations: {
            archiveTask: {
              method: "POST" as const,
              path: "/tasks/:id/archive",
              input: z.object({ id: z.string() }),
              output: z.object({ result: z.string() }),
            },
          },
        },
        client: {
          ...createMockClient(),
          archiveTask: opClient,
        },
        queryKeys: createMockQueryKeys(),
      };

      const hooks = deriveHooks(contract);

      const { result } = renderHook(() => hooks.archiveTask.useMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: "task-1" });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Operation failed");
    });
  });
});
