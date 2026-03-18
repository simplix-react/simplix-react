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

// Mock useUIComponents to return a simple CrudDelete that renders based on props
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

describe("useCrudDeleteWired", () => {
  it("returns requestDelete and null deleteDialog initially", () => {
    const deleteMutation = createDeleteMutation();
    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels }),
    );

    expect(result.current.requestDelete).toBeTypeOf("function");
    expect(result.current.deleteDialog).toBeNull();
  });

  it("shows delete dialog after requestDelete is called", () => {
    const deleteMutation = createDeleteMutation();
    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels }),
    );

    act(() => result.current.requestDelete({ id: "1", name: "Item A" }));

    expect(result.current.deleteDialog).not.toBeNull();
  });

  it("calls deleteMutation.mutate on confirm with target id", () => {
    const deleteMutation = createDeleteMutation();
    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels }),
    );

    act(() => result.current.requestDelete({ id: "42", name: "Item" }));

    // Render the dialog to get the confirm button
    const { getByTestId } = render(<>{result.current.deleteDialog}</>);
    fireEvent.click(getByTestId("confirm-btn"));

    expect(deleteMutation.mutate).toHaveBeenCalledWith("42", expect.any(Object));
  });

  it("calls onDeleted after successful delete", () => {
    const onDeleted = vi.fn();
    const deleteMutation = createDeleteMutation();
    // Make mutate call onSuccess synchronously
    deleteMutation.mutate = vi.fn((_, opts) => opts?.onSuccess?.());

    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels, onDeleted }),
    );

    act(() => result.current.requestDelete({ id: "1", name: "Item" }));
    const { getByTestId } = render(<>{result.current.deleteDialog}</>);
    fireEvent.click(getByTestId("confirm-btn"));

    expect(onDeleted).toHaveBeenCalled();
  });

  it("passes labels to the dialog", () => {
    const deleteMutation = createDeleteMutation();
    const { result } = renderHook(() =>
      useCrudDeleteWired({ deleteMutation, labels: defaultLabels }),
    );

    act(() => result.current.requestDelete({ id: "1", name: "Cat" }));

    const { getByTestId } = render(<>{result.current.deleteDialog}</>);
    expect(getByTestId("delete-title").textContent).toBe("Delete Cat?");
    expect(getByTestId("delete-desc").textContent).toBe("Are you sure you want to delete Cat?");
  });
});
