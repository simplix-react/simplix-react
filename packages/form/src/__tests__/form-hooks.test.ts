import { describe, it, expect, vi } from "vitest";
import { createUseCreateForm } from "../hooks/use-create-form.js";
import { createUseUpdateForm } from "../hooks/use-update-form.js";
import { createEntityFormHooks } from "../create-entity-form-hooks.js";
import type { AnyEntityHooks } from "../types.js";

function createMockEntityHooks(): AnyEntityHooks {
  return {
    useList: vi.fn(),
    useGet: vi.fn(),
    useCreate: vi.fn(),
    useUpdate: vi.fn(),
    useDelete: vi.fn(),
    useInfiniteList: vi.fn(),
  } as unknown as AnyEntityHooks;
}

describe("createUseCreateForm", () => {
  it("returns a function", () => {
    const hooks = createMockEntityHooks();
    const result = createUseCreateForm(hooks);
    expect(typeof result).toBe("function");
  });

  it("returned function is named useCreateForm", () => {
    const hooks = createMockEntityHooks();
    const result = createUseCreateForm(hooks);
    expect(result.name).toBe("useCreateForm");
  });

  it("returned function accepts parentId and options parameters", () => {
    const hooks = createMockEntityHooks();
    const result = createUseCreateForm(hooks);
    // useCreateForm(parentId?, options?) — 2 parameters at runtime
    expect(result.length).toBe(2);
  });

  it("creates independent hook instances per call", () => {
    const hooks1 = createMockEntityHooks();
    const hooks2 = createMockEntityHooks();
    const useCreateForm1 = createUseCreateForm(hooks1);
    const useCreateForm2 = createUseCreateForm(hooks2);
    expect(useCreateForm1).not.toBe(useCreateForm2);
  });
});

describe("createUseUpdateForm", () => {
  it("returns a function", () => {
    const hooks = createMockEntityHooks();
    const result = createUseUpdateForm(hooks);
    expect(typeof result).toBe("function");
  });

  it("returned function is named useUpdateForm", () => {
    const hooks = createMockEntityHooks();
    const result = createUseUpdateForm(hooks);
    expect(result.name).toBe("useUpdateForm");
  });

  it("returned function accepts entityId and options parameters", () => {
    const hooks = createMockEntityHooks();
    const result = createUseUpdateForm(hooks);
    // useUpdateForm(entityId, options?) — 2 parameters at runtime
    expect(result.length).toBe(2);
  });

  it("creates independent hook instances per call", () => {
    const hooks1 = createMockEntityHooks();
    const hooks2 = createMockEntityHooks();
    const useUpdateForm1 = createUseUpdateForm(hooks1);
    const useUpdateForm2 = createUseUpdateForm(hooks2);
    expect(useUpdateForm1).not.toBe(useUpdateForm2);
  });
});

describe("createEntityFormHooks", () => {
  it("returns an object with useCreateForm and useUpdateForm", () => {
    const hooks = createMockEntityHooks();
    const result = createEntityFormHooks(hooks);

    expect(result).toHaveProperty("useCreateForm");
    expect(result).toHaveProperty("useUpdateForm");
  });

  it("useCreateForm is a function named useCreateForm", () => {
    const hooks = createMockEntityHooks();
    const result = createEntityFormHooks(hooks);

    expect(typeof result.useCreateForm).toBe("function");
    expect(result.useCreateForm.name).toBe("useCreateForm");
  });

  it("useUpdateForm is a function named useUpdateForm", () => {
    const hooks = createMockEntityHooks();
    const result = createEntityFormHooks(hooks);

    expect(typeof result.useUpdateForm).toBe("function");
    expect(result.useUpdateForm.name).toBe("useUpdateForm");
  });

  it("returns only useCreateForm and useUpdateForm keys", () => {
    const hooks = createMockEntityHooks();
    const result = createEntityFormHooks(hooks);

    expect(Object.keys(result).sort()).toEqual(
      ["useCreateForm", "useUpdateForm"].sort(),
    );
  });

  it("produces distinct hooks for different entity hooks", () => {
    const hooks1 = createMockEntityHooks();
    const hooks2 = createMockEntityHooks();
    const result1 = createEntityFormHooks(hooks1);
    const result2 = createEntityFormHooks(hooks2);

    expect(result1.useCreateForm).not.toBe(result2.useCreateForm);
    expect(result1.useUpdateForm).not.toBe(result2.useUpdateForm);
  });
});
