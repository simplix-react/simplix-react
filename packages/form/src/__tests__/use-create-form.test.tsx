// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { createUseCreateForm } from "../hooks/use-create-form.js";
import type { AnyEntityHooks } from "../types.js";

// ── Mock Helpers ──

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function createMockEntityHooks(overrides?: {
  mutateAsync?: (...args: unknown[]) => Promise<unknown>;
  isPending?: boolean;
}) {
  const mutateAsync = overrides?.mutateAsync ?? vi.fn().mockResolvedValue({ id: "new-1", title: "Created" });
  const isPending = overrides?.isPending ?? false;

  return {
    useCreate: vi.fn().mockReturnValue({
      mutateAsync,
      isPending,
    }),
    useUpdate: vi.fn(),
    useGet: vi.fn(),
    useList: vi.fn(),
    useDelete: vi.fn(),
    useInfiniteList: vi.fn(),
  } as unknown as AnyEntityHooks;
}

// ── Tests ──

describe("useCreateForm (runtime)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it("returns form, isSubmitting, submitError, and reset", () => {
    const hooks = createMockEntityHooks();
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(() => useCreateForm(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.form).toBeDefined();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBeNull();
    expect(typeof result.current.reset).toBe("function");
  });

  it("calls useCreate with parentId and meta", () => {
    const hooks = createMockEntityHooks();
    const useCreateForm = createUseCreateForm(hooks);

    renderHook(() => useCreateForm("parent-123"), {
      wrapper: createWrapper(queryClient),
    });

    expect(hooks.useCreate).toHaveBeenCalledWith("parent-123", expect.objectContaining({
      meta: { handledByForm: true },
    }));
  });

  it("submits form values via mutateAsync", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "1" });
    const hooks = createMockEntityHooks({ mutateAsync });
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(
      () => useCreateForm(undefined, { defaultValues: { title: "Test" } }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(mutateAsync).toHaveBeenCalledWith({ title: "Test" });
  });

  it("calls onSuccess callback after successful submission", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "1", title: "Created" });
    const hooks = createMockEntityHooks({ mutateAsync });
    const useCreateForm = createUseCreateForm(hooks);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useCreateForm(undefined, {
        defaultValues: { title: "Test" },
        onSuccess,
      }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    // onSuccess is called via the useCreate hook's onSuccess, which the mock triggers
    // Since we mock useCreate to return { mutateAsync, isPending }, the onSuccess is passed
    // to hooks.useCreate as the second argument's onSuccess. Let's verify that.
    const useCreateCall = (hooks.useCreate as ReturnType<typeof vi.fn>).mock.calls[0];
    const mutationOptions = useCreateCall[1] as { onSuccess?: (data: unknown) => void };
    // Simulate the mutation's onSuccess callback
    mutationOptions.onSuccess?.({ id: "1", title: "Created" });

    expect(onSuccess).toHaveBeenCalledWith({ id: "1", title: "Created" });
  });

  it("sets submitError on mutation failure", async () => {
    const error = new Error("Validation failed");
    const mutateAsync = vi.fn().mockRejectedValue(error);
    const hooks = createMockEntityHooks({ mutateAsync });
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(
      () => useCreateForm(undefined, { defaultValues: { title: "" } }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.submitError).not.toBeNull();
    });

    expect(result.current.submitError!.message).toBe("Validation failed");
  });

  it("calls onError callback on mutation failure", async () => {
    const error = new Error("Server error");
    const mutateAsync = vi.fn().mockRejectedValue(error);
    const hooks = createMockEntityHooks({ mutateAsync });
    const useCreateForm = createUseCreateForm(hooks);
    const onError = vi.fn();

    const { result } = renderHook(
      () => useCreateForm(undefined, {
        defaultValues: { title: "" },
        onError,
      }),
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
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(
      () => useCreateForm(undefined, { defaultValues: {} }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.submitError).toBeInstanceOf(Error);
      expect(result.current.submitError!.message).toBe("string error");
    });
  });

  it("resets form on success by default (resetOnSuccess defaults to true)", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "1" });
    const hooks = createMockEntityHooks({ mutateAsync });
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(
      () => useCreateForm(undefined, { defaultValues: { title: "Hello" } }),
      { wrapper: createWrapper(queryClient) },
    );

    // Modify a field value before submitting
    await act(async () => {
      result.current.form.setFieldValue("title", "Modified");
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    // After success, form should reset to defaultValues
    await waitFor(() => {
      expect(result.current.form.getFieldValue("title")).toBe("Hello");
    });
  });

  it("does not reset form when resetOnSuccess is false", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "1" });
    const hooks = createMockEntityHooks({ mutateAsync });
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(
      () => useCreateForm(undefined, {
        defaultValues: { title: "Hello" },
        resetOnSuccess: false,
      }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.form.setFieldValue("title", "Modified");
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    // Form should keep the modified value
    expect(result.current.form.getFieldValue("title")).toBe("Modified");
  });

  it("reset() clears form and submitError", async () => {
    const error = new Error("fail");
    const mutateAsync = vi.fn().mockRejectedValue(error);
    const hooks = createMockEntityHooks({ mutateAsync });
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(
      () => useCreateForm(undefined, { defaultValues: { title: "Default" } }),
      { wrapper: createWrapper(queryClient) },
    );

    // Trigger an error
    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.submitError).not.toBeNull();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.submitError).toBeNull();
  });

  it("reflects isSubmitting from mutation isPending", () => {
    const hooks = createMockEntityHooks({ isPending: true });
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(() => useCreateForm(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isSubmitting).toBe(true);
  });

  it("clears previous submitError on new successful submission", async () => {
    let shouldFail = true;
    const mutateAsync = vi.fn().mockImplementation(() => {
      if (shouldFail) return Promise.reject(new Error("fail"));
      return Promise.resolve({ id: "1" });
    });
    const hooks = createMockEntityHooks({ mutateAsync });
    const useCreateForm = createUseCreateForm(hooks);

    const { result } = renderHook(
      () => useCreateForm(undefined, { defaultValues: { title: "" } }),
      { wrapper: createWrapper(queryClient) },
    );

    // First submit: fails
    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.submitError).not.toBeNull();
    });

    // Second submit: succeeds
    shouldFail = false;
    await act(async () => {
      await result.current.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.submitError).toBeNull();
    });
  });
});
