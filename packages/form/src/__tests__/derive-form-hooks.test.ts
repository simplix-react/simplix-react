import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { simpleQueryBuilder } from "@simplix-react/contract";
import { deriveFormHooks } from "../derive-form-hooks.js";

function createMockEntityHooks() {
  return {
    useList: vi.fn(),
    useGet: vi.fn(),
    useCreate: vi.fn(),
    useUpdate: vi.fn(),
    useDelete: vi.fn(),
    useInfiniteList: vi.fn(),
  };
}

describe("deriveFormHooks", () => {
  it("returns form hooks for each entity in the contract", () => {
    const mockContract = {
      config: {
        entities: {
          task: {
            schema: z.any(),
            operations: {
              list:   { method: "GET" as const,    path: "/tasks" },
              get:    { method: "GET" as const,    path: "/tasks/:id" },
              create: { method: "POST" as const,   path: "/tasks", input: z.any() },
              update: { method: "PATCH" as const,  path: "/tasks/:id", input: z.any() },
              delete: { method: "DELETE" as const, path: "/tasks/:id" },
            },
          },
          project: {
            schema: z.any(),
            operations: {
              list:   { method: "GET" as const,    path: "/projects" },
              get:    { method: "GET" as const,    path: "/projects/:id" },
              create: { method: "POST" as const,   path: "/projects", input: z.any() },
              update: { method: "PATCH" as const,  path: "/projects/:id", input: z.any() },
              delete: { method: "DELETE" as const, path: "/projects/:id" },
            },
          },
        },
        domain: "test",
        basePath: "/api/test",
        queryBuilder: simpleQueryBuilder,
      },
    };

    const mockHooks = {
      task: createMockEntityHooks(),
      project: createMockEntityHooks(),
    };

    const result = deriveFormHooks(mockContract, mockHooks);

    expect(result).toHaveProperty("task");
    expect(result).toHaveProperty("project");

    expect(result.task).toHaveProperty("useCreateForm");
    expect(result.task).toHaveProperty("useUpdateForm");
    expect(typeof result.task.useCreateForm).toBe("function");
    expect(typeof result.task.useUpdateForm).toBe("function");

    expect(result.project).toHaveProperty("useCreateForm");
    expect(result.project).toHaveProperty("useUpdateForm");
    expect(typeof result.project.useCreateForm).toBe("function");
    expect(typeof result.project.useUpdateForm).toBe("function");
  });
});
