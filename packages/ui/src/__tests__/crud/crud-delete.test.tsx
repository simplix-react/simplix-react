// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      if (values) return `${key}:${JSON.stringify(values)}`;
      return key;
    },
    locale: "en",
    exists: () => true,
  }),
}));

import { CrudDelete } from "../../crud/delete/crud-delete";

describe("CrudDelete", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <CrudDelete open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(container.textContent).toBe("");
  });

  it("renders title and description when open", () => {
    render(
      <CrudDelete
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete this item?"
        description="This is permanent."
      />,
    );

    expect(screen.getByText("Delete this item?")).toBeTruthy();
    expect(screen.getByText("This is permanent.")).toBeTruthy();
  });

  it("uses default title from translation when no title prop", () => {
    render(
      <CrudDelete
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        entityName="pet"
      />,
    );

    // t("list.deleteTitle", { entity: "pet" })
    expect(screen.getByText(/list\.deleteTitle/)).toBeTruthy();
  });

  it("calls onConfirm when delete button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <CrudDelete
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        deleteLabel="Delete"
      />,
    );

    fireEvent.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows custom cancel and delete labels", () => {
    render(
      <CrudDelete
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        cancelLabel="Nope"
        deleteLabel="Remove"
      />,
    );

    expect(screen.getByText("Nope")).toBeTruthy();
    expect(screen.getByText("Remove")).toBeTruthy();
  });

  it("shows deletingLabel when loading", () => {
    render(
      <CrudDelete
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        loading={true}
        deletingLabel="Removing..."
        deleteLabel="Remove"
      />,
    );

    expect(screen.getByText("Removing...")).toBeTruthy();
    expect(screen.queryByText("Remove")).toBeNull();
  });

  it("disables buttons when loading", () => {
    render(
      <CrudDelete
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        loading={true}
        cancelLabel="Cancel"
        deletingLabel="Deleting..."
      />,
    );

    const cancelBtn = screen.getByText("Cancel");
    const deleteBtn = screen.getByText("Deleting...");
    expect(cancelBtn).toHaveProperty("disabled", true);
    expect(deleteBtn).toHaveProperty("disabled", true);
  });
});
