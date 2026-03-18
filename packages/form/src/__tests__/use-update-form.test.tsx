// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { createUseUpdateForm } from "../hooks/use-update-form.js";
import type { AnyEntityHooks } from "../types.js";

// ── Mock Helpers ──

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function createMockEntityHooks(overrides?: {
  entity?: Record<string, unknown> | undefined;
  isLoading?: boolean;
  dataUpdatedAt?: number;
  mutateAsync?: (...args: unknown[]) => Promise<unknown>;
  isPending?: boolean;
}) {
  const entity = overrides && "entity" in overrides
    ? overrides.entity
    : { id: "1", title: "Existing", status: "open" };
  const isLoading = overrides?.isLoading ?? false;
  const dataUpdatedAt = overrides?.dataUpdatedAt ?? Date.now();
  const mutateAsync = overrides?.mutateAsync ?? vi.fn().mockResolvedValue({ id: "1", title: "Updated" });
  const isPending = overrides?.isPending ?? false;

  return {
    useGet: vi.fn().mockReturnValue({
      data: entity,
      isLoading,
      dataUpdatedAt,
    }),
    useUpdate: vi.fn().mockReturnValue({
      mutateAsync,
      isPending,
    }),
    useCreate: vi.fn(),
    useList: vi.fn(),
    useDelete: vi.fn(),
    useInfiniteList: vi.fn(),
  } as unknown as AnyEntityHooks;
}

// ── Tests ──

describe("useUpdateForm (runtime)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it("returns form, isLoading, isSubmitting, submitError, and entity", () => {
    const hooks = createMockEntityHooks();
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.form).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBeNull();
    expect(result.current.entity).toEqual({ id: "1", title: "Existing", status: "open" });
  });

  it("calls useGet with entityId", () => {
    const hooks = createMockEntityHooks();
    const useUpdateForm = createUseUpdateForm(hooks);

    renderHook(() => useUpdateForm("entity-42"), {
      wrapper: createWrapper(queryClient),
    });

    expect(hooks.useGet).toHaveBeenCalledWith("entity-42");
  });

  it("calls useUpdate with meta", () => {
    const hooks = createMockEntityHooks();
    const useUpdateForm = createUseUpdateForm(hooks);

    renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(hooks.useUpdate).toHaveBeenCalledWith(expect.objectContaining({
      meta: { handledByForm: true },
    }));
  });

  it("reports isLoading when entity data is loading", () => {
    const hooks = createMockEntityHooks({ isLoading: true, entity: undefined });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.entity).toBeUndefined();
  });

  it("reflects isSubmitting from mutation isPending", () => {
    const hooks = createMockEntityHooks({ isPending: true });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isSubmitting).toBe(true);
  });

  it("submits only dirty fields by default (dirtyOnly=true)", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "1", title: "Updated" });
    const hooks = createMockEntityHooks({
      entity: { id: "1", title: "Original", status: "open" },
      mutateAsync,
    });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    // Modify only the title field
    await act(async () => {
      result.current.form.setFieldValue("title", "Changed");
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    // Should only send the dirty field (title changed, status unchanged)
    expect(mutateAsync).toHaveBeenCalledWith({
      id: "1",
      dto: { title: "Changed" },
    });
  });

  it("submits all fields when dirtyOnly is false", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "1" });
    const hooks = createMockEntityHooks({
      entity: { id: "1", title: "Original", status: "open" },
      mutateAsync,
    });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(
      () => useUpdateForm("1", { dirtyOnly: false }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.form.setFieldValue("title", "Changed");
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    // Should send all fields, not just dirty ones
    expect(mutateAsync).toHaveBeenCalledWith({
      id: "1",
      dto: expect.objectContaining({
        title: "Changed",
        status: "open",
      }),
    });
  });

  it("does not submit when dirtyOnly=true and entity is not loaded", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    const hooks = createMockEntityHooks({
      entity: undefined,
      isLoading: true,
      mutateAsync,
    });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("sets submitError on mutation failure", async () => {
    const error = new Error("Update failed");
    const mutateAsync = vi.fn().mockRejectedValue(error);
    const hooks = createMockEntityHooks({ mutateAsync });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.submitError).not.toBeNull();
    });

    expect(result.current.submitError!.message).toBe("Update failed");
  });

  it("calls onError callback on mutation failure", async () => {
    const error = new Error("Conflict");
    const mutateAsync = vi.fn().mockRejectedValue(error);
    const hooks = createMockEntityHooks({ mutateAsync });
    const useUpdateForm = createUseUpdateForm(hooks);
    const onError = vi.fn();

    const { result } = renderHook(
      () => useUpdateForm("1", { onError }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it("wraps non-Error thrown values in Error", async () => {
    const mutateAsync = vi.fn().mockRejectedValue("string error");
    const hooks = createMockEntityHooks({ mutateAsync });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.submitError).toBeInstanceOf(Error);
      expect(result.current.submitError!.message).toBe("string error");
    });
  });

  it("calls onSuccess callback via useUpdate hook options", () => {
    const hooks = createMockEntityHooks();
    const useUpdateForm = createUseUpdateForm(hooks);
    const onSuccess = vi.fn();

    renderHook(
      () => useUpdateForm("1", { onSuccess }),
      { wrapper: createWrapper(queryClient) },
    );

    // Verify the onSuccess callback is wired into useUpdate's options
    const useUpdateCall = (hooks.useUpdate as ReturnType<typeof vi.fn>).mock.calls[0];
    const mutationOptions = useUpdateCall[0] as { onSuccess?: (data: unknown) => void };
    mutationOptions.onSuccess?.({ id: "1", title: "Updated" });

    expect(onSuccess).toHaveBeenCalledWith({ id: "1", title: "Updated" });
  });

  it("uses entity data as form defaultValues", () => {
    const entity = { id: "1", title: "My Entity", status: "active" };
    const hooks = createMockEntityHooks({ entity });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.form.getFieldValue("title")).toBe("My Entity");
    expect(result.current.form.getFieldValue("status")).toBe("active");
  });

  it("uses empty object as defaultValues when entity is undefined", () => {
    const hooks = createMockEntityHooks({ entity: undefined, isLoading: true });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    // Form should be created with empty defaults
    expect(result.current.form).toBeDefined();
  });

  it("resets form when dataUpdatedAt changes (entity refetch)", () => {
    const initialTimestamp = 1000;
    const entity = { id: "1", title: "Original", status: "open" };
    const hooks = createMockEntityHooks({ entity, dataUpdatedAt: initialTimestamp });
    const useUpdateForm = createUseUpdateForm(hooks);

    const { result, rerender } = renderHook(() => useUpdateForm("1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.form.getFieldValue("title")).toBe("Original");

    // Simulate entity refetch: new dataUpdatedAt, new entity data
    const updatedEntity = { id: "1", title: "Refetched", status: "closed" };
    (hooks.useGet as ReturnType<typeof vi.fn>).mockReturnValue({
      data: updatedEntity,
      isLoading: false,
      dataUpdatedAt: 2000,
    });

    rerender();

    expect(result.current.form.getFieldValue("title")).toBe("Refetched");
    expect(result.current.form.getFieldValue("status")).toBe("closed");
  });
});
