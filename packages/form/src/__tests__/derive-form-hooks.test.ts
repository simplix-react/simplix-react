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
            path: "/tasks",
            schema: z.any(),
            createSchema: z.any(),
            updateSchema: z.any(),
          },
          project: {
            path: "/projects",
            schema: z.any(),
            createSchema: z.any(),
            updateSchema: z.any(),
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
