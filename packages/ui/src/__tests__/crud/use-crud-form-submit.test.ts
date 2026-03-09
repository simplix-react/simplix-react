// @vitest-environment jsdom
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useCrudFormSubmit, type CrudMutation } from "../../crud/form/use-crud-form-submit";

function createMutation<T>(
  isPending = false,
  { rejectWith }: { rejectWith?: unknown } = {},
): CrudMutation<T> {
  return {
    mutate: vi.fn(),
    mutateAsync: rejectWith
      ? vi.fn().mockRejectedValue(rejectWith)
      : vi.fn().mockResolvedValue(undefined),
    isPending,
  };
}

describe("useCrudFormSubmit", () => {
  describe("create mode (no entityId)", () => {
    it("returns isEdit as false", () => {
      const create = createMutation<{ name: string }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      expect(result.current.isEdit).toBe(false);
    });

    it("calls create.mutateAsync on handleSubmit", () => {
      const create = createMutation<{ name: string }>();
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create, onSuccess }),
      );

      act(() => result.current.handleSubmit({ name: "Alice" }));

      expect(create.mutateAsync).toHaveBeenCalledWith(
        { name: "Alice" },
      );
    });

    it("calls onSuccess after successful mutation", async () => {
      const create = createMutation<{ name: string }>();
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create, onSuccess }),
      );

      act(() => result.current.handleSubmit({ name: "Alice" }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it("uses create.isPending for isPending", () => {
      const create = createMutation<{ name: string }>(true);
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      expect(result.current.isPending).toBe(true);
    });
  });

  describe("edit mode (with entityId)", () => {
    it("returns isEdit as true", () => {
      const create = createMutation<{ name: string }>();
      const update = createMutation<{ id: string; dto: { name: string } }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: "123", create, update }),
      );

      expect(result.current.isEdit).toBe(true);
    });

    it("calls update.mutateAsync on handleSubmit", () => {
      const create = createMutation<{ name: string }>();
      const update = createMutation<{ id: string; dto: { name: string } }>();
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: "123", create, update, onSuccess }),
      );

      act(() => result.current.handleSubmit({ name: "Updated" }));

      expect(update.mutateAsync).toHaveBeenCalledWith(
        { id: "123", dto: { name: "Updated" } },
      );
      expect(create.mutateAsync).not.toHaveBeenCalled();
    });

    it("uses update.isPending for isPending in edit mode", () => {
      const create = createMutation<{ name: string }>(false);
      const update = createMutation<{ id: string; dto: { name: string } }>(true);
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: "abc", create, update }),
      );

      expect(result.current.isPending).toBe(true);
    });

    it("falls back to create when entityId is present but update is undefined", () => {
      const create = createMutation<{ name: string }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: "123", create }),
      );

      // isEdit is true but no update hook, so handleSubmit falls to create
      act(() => result.current.handleSubmit({ name: "test" }));
      expect(create.mutateAsync).toHaveBeenCalled();
    });
  });

  describe("entityId edge cases", () => {
    it("treats empty string entityId as create mode", () => {
      const create = createMutation<{ name: string }>();
      const update = createMutation<{ id: string; dto: { name: string } }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: "", create, update }),
      );

      expect(result.current.isEdit).toBe(false);
    });

    it("treats null entityId as create mode", () => {
      const create = createMutation<{ name: string }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: null as unknown as undefined, create }),
      );

      expect(result.current.isEdit).toBe(false);
    });

    it("treats 0 entityId as edit mode", () => {
      const create = createMutation<{ name: string }>();
      const update = createMutation<{ id: number; dto: { name: string } }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: 0, create, update }),
      );

      expect(result.current.isEdit).toBe(true);
    });
  });

  describe("server validation errors (fieldErrors)", () => {
    it("returns empty fieldErrors initially", () => {
      const create = createMutation<{ name: string }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      expect(result.current.fieldErrors).toEqual({});
    });

    it("sets fieldErrors from server validation response (errorDetail)", async () => {
      const serverError = {
        status: 400,
        message: "Validation failed",
        errorDetail: [
          { field: "name", message: "must not be empty" },
          { field: "email", message: "invalid format" },
        ],
      };
      const create = createMutation<{ name: string; email: string }>(false, {
        rejectWith: serverError,
      });
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      act(() => result.current.handleSubmit({ name: "", email: "bad" }));

      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({
          name: "must not be empty",
          email: "invalid format",
        });
      });
    });

    it("joins multiple errors for the same field", async () => {
      const serverError = {
        status: 400,
        message: "Validation failed",
        errorDetail: [
          { field: "name", message: "must not be empty" },
          { field: "name", message: "min length is 3" },
        ],
      };
      const create = createMutation<{ name: string }>(false, {
        rejectWith: serverError,
      });
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      act(() => result.current.handleSubmit({ name: "" }));

      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({
          name: "must not be empty, min length is 3",
        });
      });
    });

    it("clears fieldErrors on re-submit", async () => {
      const serverError = {
        status: 400,
        message: "Validation failed",
        errorDetail: [{ field: "name", message: "required" }],
      };
      const create = createMutation<{ name: string }>(false, {
        rejectWith: serverError,
      });
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      // First submit: triggers validation error
      act(() => result.current.handleSubmit({ name: "" }));

      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({ name: "required" });
      });

      // Second submit: switch to a succeeding mutation
      (create.mutateAsync as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      act(() => result.current.handleSubmit({ name: "Alice" }));

      // Field errors should be cleared immediately on re-submit
      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({});
      });
    });

    it("does not set fieldErrors for non-validation errors", async () => {
      const serverError = new Error("Internal Server Error");
      const create = createMutation<{ name: string }>(false, {
        rejectWith: serverError,
      });
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      act(() => result.current.handleSubmit({ name: "test" }));

      // Wait for promise to settle, fieldErrors should remain empty
      await waitFor(() => {
        expect(create.mutateAsync).toHaveBeenCalled();
      });
      expect(result.current.fieldErrors).toEqual({});
    });
  });
});
