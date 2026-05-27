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

  describe("i18nFields option (locale-order fallback)", () => {
    const LOCALES_EN_FIRST = [{ value: "en" }, { value: "ko" }];

    it("populates plain field from i18n map on create (en-first)", () => {
      const create = createMutation<{ menuName: string; menuNameI18n: Record<string, string> }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({
          create,
          i18nFields: { menuNameI18n: "menuName" },
          locales: LOCALES_EN_FIRST,
        }),
      );

      act(() =>
        result.current.handleSubmit({
          menuName: "",
          menuNameI18n: { en: "Home", ko: "홈" },
        }),
      );

      expect(create.mutateAsync).toHaveBeenCalledWith({
        menuName: "Home",
        menuNameI18n: { en: "Home", ko: "홈" },
      });
    });

    it("populates plain field from i18n map on update (en-first)", () => {
      const create = createMutation<{ menuName: string; menuNameI18n: Record<string, string> }>();
      const update = createMutation<{ id: string; dto: { menuName: string; menuNameI18n: Record<string, string> } }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({
          entityId: "abc",
          create,
          update,
          i18nFields: { menuNameI18n: "menuName" },
          locales: LOCALES_EN_FIRST,
        }),
      );

      act(() =>
        result.current.handleSubmit({
          menuName: "",
          menuNameI18n: { en: "Home", ko: "홈" },
        }),
      );

      expect(update.mutateAsync).toHaveBeenCalledWith({
        id: "abc",
        dto: { menuName: "Home", menuNameI18n: { en: "Home", ko: "홈" } },
      });
    });

    it("respects locale config order (ko-first prefers ko over en)", () => {
      const create = createMutation<{ menuName: string; menuNameI18n: Record<string, string> }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({
          create,
          i18nFields: { menuNameI18n: "menuName" },
          locales: [{ value: "ko" }, { value: "en" }],
        }),
      );

      act(() =>
        result.current.handleSubmit({
          menuName: "",
          menuNameI18n: { en: "Home", ko: "홈" },
        }),
      );

      expect(create.mutateAsync).toHaveBeenCalledWith({
        menuName: "홈",
        menuNameI18n: { en: "Home", ko: "홈" },
      });
    });

    it("passes values through unchanged when i18nFields is omitted", () => {
      const create = createMutation<{ menuName: string }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      act(() => result.current.handleSubmit({ menuName: "Home" }));

      expect(create.mutateAsync).toHaveBeenCalledWith({ menuName: "Home" });
    });
  });

  describe("client-side validator option", () => {
    // T1 — validator unset: existing behavior, mutate is called
    it("calls mutate when validator is unset", () => {
      const create = createMutation<{ name: string }>();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create }),
      );

      act(() => result.current.handleSubmit({ name: "Alice" }));

      expect(create.mutateAsync).toHaveBeenCalledWith({ name: "Alice" });
    });

    // T2 — validator returns null: pass-through
    it("calls mutate when validator returns null", () => {
      const create = createMutation<{ name: string }>();
      const validator = vi.fn().mockReturnValue(null);
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create, validator }),
      );

      act(() => result.current.handleSubmit({ name: "Alice" }));

      expect(validator).toHaveBeenCalledWith({ name: "Alice" });
      expect(create.mutateAsync).toHaveBeenCalled();
      expect(result.current.fieldErrors).toEqual({});
    });

    // T3 — validator returns empty object: pass-through (size 0)
    it("calls mutate when validator returns an empty object", () => {
      const create = createMutation<{ name: string }>();
      const validator = vi.fn().mockReturnValue({});
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create, validator }),
      );

      act(() => result.current.handleSubmit({ name: "Alice" }));

      expect(create.mutateAsync).toHaveBeenCalled();
      expect(result.current.fieldErrors).toEqual({});
    });

    // T4 — validator returns errors: sets fieldErrors, mutate NOT called
    it("sets fieldErrors and skips mutate when validator returns errors", async () => {
      const create = createMutation<{ name: string }>();
      const update = createMutation<{ id: string; dto: { name: string } }>();
      const validator = vi.fn().mockReturnValue({ name: "필수" });
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: "123", create, update, validator }),
      );

      act(() => result.current.handleSubmit({ name: "" }));

      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({ name: "필수" });
      });
      expect(create.mutateAsync).not.toHaveBeenCalled();
      expect(update.mutateAsync).not.toHaveBeenCalled();
    });

    // T5 — client fail → new client fail: errors are replaced
    it("replaces fieldErrors with new client errors on consecutive client failures", async () => {
      const create = createMutation<{ name: string }>();
      let next: Record<string, string> | null = { name: "first" };
      const validator = vi.fn(() => next);
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create, validator }),
      );

      act(() => result.current.handleSubmit({ name: "" }));
      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({ name: "first" });
      });

      next = { name: "second" };
      act(() => result.current.handleSubmit({ name: "" }));
      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({ name: "second" });
      });
      expect(create.mutateAsync).not.toHaveBeenCalled();
    });

    // T6 — client pass → server fail: fieldErrors set from server response
    it("sets fieldErrors from server when client passes but server fails", async () => {
      const serverError = {
        status: 400,
        errorDetail: [{ field: "name", message: "already taken" }],
      };
      const create = createMutation<{ name: string }>(false, {
        rejectWith: serverError,
      });
      const validator = vi.fn().mockReturnValue(null);
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create, validator }),
      );

      act(() => result.current.handleSubmit({ name: "Alice" }));

      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({ name: "already taken" });
      });
      expect(create.mutateAsync).toHaveBeenCalled();
    });

    // T7 — server fail visible → next submit with client fail: errors replace server→client
    it("replaces visible server errors with client errors on next submit failure", async () => {
      const serverError = {
        status: 400,
        errorDetail: [{ field: "name", message: "server rejects" }],
      };
      const create = createMutation<{ name: string }>(false, {
        rejectWith: serverError,
      });
      let clientErrs: Record<string, string> | null = null;
      const validator = vi.fn(() => clientErrs);
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create, validator }),
      );

      // First submit: client passes, server fails
      act(() => result.current.handleSubmit({ name: "Alice" }));
      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({ name: "server rejects" });
      });

      // Second submit: client fails this time
      clientErrs = { name: "client rejects" };
      act(() => result.current.handleSubmit({ name: "" }));
      await waitFor(() => {
        expect(result.current.fieldErrors).toEqual({ name: "client rejects" });
      });
    });

    // T8 — validator receives the raw values BEFORE i18n fallback
    it("passes pre-i18n-fallback values to the validator", () => {
      const create = createMutation<{ menuName: string; menuNameI18n: Record<string, string> }>();
      const validator = vi.fn().mockReturnValue(null);
      const { result } = renderHook(() =>
        useCrudFormSubmit({
          create,
          i18nFields: { menuNameI18n: "menuName" },
          locales: [{ value: "en" }, { value: "ko" }],
          validator,
        }),
      );

      act(() =>
        result.current.handleSubmit({
          // Raw user input: menuName is still empty before fallback.
          menuName: "",
          menuNameI18n: { en: "Home", ko: "홈" },
        }),
      );

      // Validator must see the raw empty menuName, not the fallback-populated "Home".
      expect(validator).toHaveBeenCalledWith({
        menuName: "",
        menuNameI18n: { en: "Home", ko: "홈" },
      });

      // mutate, however, still receives the fallback-populated values.
      expect(create.mutateAsync).toHaveBeenCalledWith({
        menuName: "Home",
        menuNameI18n: { en: "Home", ko: "홈" },
      });
    });
  });
});
