// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

vi.mock("../../crud/form/use-before-unload", () => ({
  useBeforeUnload: vi.fn(),
}));

import React, { useState } from "react";
import { useUnsavedChanges } from "../../crud/form/use-unsaved-changes";

function TestComponent({ isDirty }: { isDirty: boolean }) {
  const [navigated, setNavigated] = useState(false);
  const { guardedNavigate, dialog } = useUnsavedChanges({ isDirty });

  return (
    <div>
      <button
        data-testid="navigate-btn"
        onClick={() => guardedNavigate(() => setNavigated(true))}
      >
        Navigate
      </button>
      {navigated && <span data-testid="navigated">Navigated!</span>}
      {dialog}
    </div>
  );
}

describe("useUnsavedChanges", () => {
  it("navigates immediately when not dirty", () => {
    render(<TestComponent isDirty={false} />);
    fireEvent.click(screen.getByTestId("navigate-btn"));
    expect(screen.getByTestId("navigated")).toBeTruthy();
  });

  it("shows dialog when dirty and trying to navigate", () => {
    render(<TestComponent isDirty={true} />);
    fireEvent.click(screen.getByTestId("navigate-btn"));
    // Should not have navigated
    expect(screen.queryByTestId("navigated")).toBeNull();
    // Dialog should be visible
    expect(screen.getByText("common.unsavedTitle")).toBeTruthy();
    expect(screen.getByText("common.unsavedDescription")).toBeTruthy();
  });

  it("shows cancel and discard buttons in dialog", () => {
    render(<TestComponent isDirty={true} />);
    fireEvent.click(screen.getByTestId("navigate-btn"));
    expect(screen.getByText("common.cancel")).toBeTruthy();
    expect(screen.getByText("common.discard")).toBeTruthy();
  });

  it("dismisses dialog on cancel without navigating", () => {
    render(<TestComponent isDirty={true} />);
    fireEvent.click(screen.getByTestId("navigate-btn"));
    expect(screen.getByText("common.unsavedTitle")).toBeTruthy();

    fireEvent.click(screen.getByText("common.cancel"));
    // Should not have navigated
    expect(screen.queryByTestId("navigated")).toBeNull();
  });

  it("navigates on discard confirmation", () => {
    render(<TestComponent isDirty={true} />);
    fireEvent.click(screen.getByTestId("navigate-btn"));
    fireEvent.click(screen.getByText("common.discard"));
    expect(screen.getByTestId("navigated")).toBeTruthy();
  });

  it("returns guardedNavigate function and dialog node", () => {
    const { result } = renderHook(() => useUnsavedChanges({ isDirty: false }));
    expect(typeof result.current.guardedNavigate).toBe("function");
    expect(result.current.dialog).toBeDefined();
  });
});
