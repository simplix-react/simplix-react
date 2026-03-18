// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { QueryFallback } from "../../crud/shared/query-fallback";

describe("QueryFallback", () => {
  beforeEach(() => {
    // Reset URL to clean state
    window.history.replaceState(null, "", "/");
  });

  it("renders spinner when loading", () => {
    const { container } = render(
      <QueryFallback isLoading={true} />,
    );
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });

  it("renders not found text when not loading and no onNotFound", () => {
    render(<QueryFallback isLoading={false} />);
    expect(screen.getByText("common.notFound")).toBeTruthy();
  });

  it("renders custom notFoundMessage when not loading and no onNotFound", () => {
    render(
      <QueryFallback isLoading={false} notFoundMessage="Pet not found." />,
    );
    expect(screen.getByText("Pet not found.")).toBeTruthy();
  });

  it("renders not-found dialog when not loading and onNotFound is provided", async () => {
    const onNotFound = vi.fn();
    render(
      <QueryFallback
        isLoading={false}
        onNotFound={onNotFound}
        notFoundMessage="Item not found"
      />,
    );

    // The dialog should open (rendered via ConfirmDialog)
    await waitFor(() => {
      expect(screen.getByText("common.notFoundTitle")).toBeTruthy();
    });
  });

  it("does not render dialog when still loading", () => {
    const onNotFound = vi.fn();
    const { container } = render(
      <QueryFallback isLoading={true} onNotFound={onNotFound} />,
    );
    // Should show spinner, not dialog
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("calls onNotFound and cleans URL params on confirm", async () => {
    // Set up URL with id and mode params
    window.history.replaceState(null, "", "/?id=123&mode=edit");

    const onNotFound = vi.fn();
    render(
      <QueryFallback
        isLoading={false}
        onNotFound={onNotFound}
      />,
    );

    // Wait for the dialog to open (effect triggers setDialogOpen)
    await waitFor(() => {
      expect(screen.getByText("common.notFoundTitle")).toBeTruthy();
    });

    // The confirm button text is t("common.confirm")
    const confirmBtn = screen.getByText("common.confirm");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onNotFound).toHaveBeenCalled();
    });

    // URL params should be cleaned
    const url = new URL(window.location.href);
    expect(url.searchParams.get("id")).toBeNull();
    expect(url.searchParams.get("mode")).toBeNull();
  });
});
