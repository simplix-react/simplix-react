// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { ConfirmDialog } from "../../crud/shared/confirm-dialog";

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        onOpenChange={vi.fn()}
        title="Confirm?"
        onConfirm={vi.fn()}
      />,
    );
    expect(container.textContent).toBe("");
  });

  it("renders title when open", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Are you sure?"
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText("Are you sure?")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        description="This cannot be undone."
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText("This cannot be undone.")).toBeTruthy();
  });

  it("does not render description when not provided", () => {
    const { container } = render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        description={undefined}
        onConfirm={vi.fn()}
      />,
    );
    // AlertDialogDescription should not be rendered
    expect(container.querySelector("[class*='text-muted-foreground']")).toBeNull();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        onConfirm={onConfirm}
        confirmLabel="Yes"
      />,
    );
    fireEvent.click(screen.getByText("Yes"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows cancel button by default", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        onConfirm={vi.fn()}
        cancelLabel="No"
      />,
    );
    expect(screen.getByText("No")).toBeTruthy();
  });

  it("hides cancel button when hideCancel is true", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Info"
        onConfirm={vi.fn()}
        hideCancel={true}
        cancelLabel="Cancel"
      />,
    );
    expect(screen.queryByText("Cancel")).toBeNull();
  });

  it("disables buttons when isPending", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        onConfirm={vi.fn()}
        isPending={true}
        confirmLabel="OK"
        cancelLabel="Cancel"
      />,
    );
    expect(screen.getByText("OK")).toHaveProperty("disabled", true);
    expect(screen.getByText("Cancel")).toHaveProperty("disabled", true);
  });

  it("shows pendingLabel when isPending", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        description="desc"
        onConfirm={vi.fn()}
        isPending={true}
        confirmLabel="OK"
        pendingLabel="Processing..."
      />,
    );
    expect(screen.getByText("Processing...")).toBeTruthy();
  });

  it("uses translation fallback for confirm/cancel labels", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        description="desc"
        onConfirm={vi.fn()}
      />,
    );
    // t("common.confirm") and t("common.cancel") from mock
    expect(screen.getByText("common.confirm")).toBeTruthy();
    expect(screen.getByText("common.cancel")).toBeTruthy();
  });
});
