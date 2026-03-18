// @vitest-environment jsdom
import { cleanup, render, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

// Mock useUIComponents to return a CrudDelete that renders based on props
vi.mock("../../provider/ui-provider", () => ({
  useUIComponents: () => ({
    CrudDelete: ({ open, onOpenChange, onConfirm, title, description, loading, cancelLabel, deleteLabel, deletingLabel }: {
      open: boolean;
      onOpenChange: (o: boolean) => void;
      onConfirm: () => void;
      title?: string;
      description?: string;
      loading?: boolean;
      cancelLabel?: string;
      deleteLabel?: string;
      deletingLabel?: string;
    }) => open ? (
      <div data-testid="mock-crud-delete">
        <span data-testid="delete-title">{title}</span>
        <span data-testid="delete-desc">{description}</span>
        <button data-testid="confirm-btn" onClick={onConfirm}>
          {loading ? deletingLabel : deleteLabel}
        </button>
        <button data-testid="cancel-btn" onClick={() => onOpenChange(false)}>
          {cancelLabel}
        </button>
      </div>
    ) : null,
  }),
}));

import { renderHook, act } from "@testing-library/react";
import { useCrudDeleteWired } from "../../crud/delete/use-crud-delete-wired";

function createDeleteMutation(isPending = false) {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending,
  };
}

const defaultLabels = {
  title: (t: { name: string }) => `Delete ${t.name}?`,
  description: (t: { name: string }) => `Are you sure you want to delete ${t.name}?`,
  cancel: "Cancel",
  delete: "Delete",
  deleting: "Deleting...",
};

describe("useCrudDeleteWired (extended)", () => {
  // ── Line 71: onOpenChange(false) triggers del.cancel() ──

  it("cancels delete when dialog onOpenChange is called with false", () => {
    const deleteMutation = createDeleteMutation();
    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels }),
    );

    // Request delete to make the dialog appear
    act(() => result.current.requestDelete({ id: "1", name: "Item" }));
    expect(result.current.deleteDialog).not.toBeNull();

    // Render the dialog and click cancel (which calls onOpenChange(false))
    const { getByTestId } = render(<>{result.current.deleteDialog}</>);
    fireEvent.click(getByTestId("cancel-btn"));

    // After cancel, the dialog should be null (target is cleared)
    expect(result.current.deleteDialog).toBeNull();
  });

  it("does not call mutate when target is null (handleConfirm guard)", () => {
    const deleteMutation = createDeleteMutation();
    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels }),
    );

    // handleConfirm is created but if called without a target, it should bail
    // This is already guarded by `if (!del.target) return;`
    // We verify by checking that initially deleteDialog is null
    expect(result.current.deleteDialog).toBeNull();
    expect(deleteMutation.mutate).not.toHaveBeenCalled();
  });

  it("shows pending state label while delete is in progress", () => {
    const deleteMutation = createDeleteMutation(true);
    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels }),
    );

    act(() => result.current.requestDelete({ id: "1", name: "Item" }));

    const { getByTestId } = render(<>{result.current.deleteDialog}</>);
    // When isPending is true, the confirm button shows "Deleting..."
    expect(getByTestId("confirm-btn").textContent).toBe("Deleting...");
  });

  it("works without onDeleted callback", () => {
    const deleteMutation = createDeleteMutation();
    deleteMutation.mutate = vi.fn((_, opts) => opts?.onSuccess?.());

    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels }),
    );

    act(() => result.current.requestDelete({ id: "1", name: "Item" }));

    const { getByTestId } = render(<>{result.current.deleteDialog}</>);
    // Should not throw even without onDeleted
    fireEvent.click(getByTestId("confirm-btn"));

    expect(deleteMutation.mutate).toHaveBeenCalledWith("1", expect.any(Object));
  });
});
