// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useCrudFormSubmit, type CrudMutation } from "../../crud/form/use-crud-form-submit";

function createMutation<T>(isPending = false): CrudMutation<T> {
  return { mutate: vi.fn(), isPending };
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

    it("calls create.mutate on handleSubmit", () => {
      const create = createMutation<{ name: string }>();
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ create, onSuccess }),
      );

      act(() => result.current.handleSubmit({ name: "Alice" }));

      expect(create.mutate).toHaveBeenCalledWith(
        { name: "Alice" },
        { onSuccess },
      );
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

    it("calls update.mutate on handleSubmit", () => {
      const create = createMutation<{ name: string }>();
      const update = createMutation<{ id: string; dto: { name: string } }>();
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useCrudFormSubmit({ entityId: "123", create, update, onSuccess }),
      );

      act(() => result.current.handleSubmit({ name: "Updated" }));

      expect(update.mutate).toHaveBeenCalledWith(
        { id: "123", dto: { name: "Updated" } },
        { onSuccess },
      );
      expect(create.mutate).not.toHaveBeenCalled();
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
      // Actually from the source: if (isEdit && update) ... else create.mutate
      act(() => result.current.handleSubmit({ name: "test" }));
      expect(create.mutate).toHaveBeenCalled();
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

      // 0 != null is true, but 0 !== "" is true, so isEdit = true
      // Actually: entityId != null (0 != null => true) && entityId !== "" (0 !== "" => true)
      expect(result.current.isEdit).toBe(true);
    });
  });
});
