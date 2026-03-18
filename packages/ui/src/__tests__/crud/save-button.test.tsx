// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { SaveButton } from "../../crud/form/save-button";

describe("SaveButton", () => {
  it("renders children text", () => {
    render(<SaveButton>Save</SaveButton>);
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("is enabled when isDirty=true (default)", () => {
    render(<SaveButton>Save</SaveButton>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveProperty("disabled", false);
  });

  it("is disabled when isDirty=false", () => {
    render(<SaveButton isDirty={false}>Save</SaveButton>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveProperty("disabled", true);
  });

  it("is disabled when disabled prop is true regardless of isDirty", () => {
    render(<SaveButton isDirty={true} disabled={true}>Save</SaveButton>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveProperty("disabled", true);
  });

  it("shows error badge with validationCount", () => {
    render(
      <SaveButton validationCount={3}>Save</SaveButton>,
    );
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("shows error badge from fieldErrors when no validationCount", () => {
    render(
      <SaveButton fieldErrors={{ name: "required", email: "invalid" }}>
        Save
      </SaveButton>,
    );
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("prefers validationCount over fieldErrors count", () => {
    render(
      <SaveButton validationCount={5} fieldErrors={{ name: "err" }}>
        Save
      </SaveButton>,
    );
    // Should show 5 (from validationCount), not 1 (from fieldErrors)
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.queryByText("1")).toBeNull();
  });

  it("does not show error badge when count is 0", () => {
    render(
      <SaveButton validationCount={0} fieldErrors={{}}>
        Save
      </SaveButton>,
    );
    // Badge should not render
    const badge = document.querySelector("[data-variant]");
    expect(badge).toBeNull();
  });

  it("does not show error badge when saving", () => {
    render(
      <SaveButton isSaving={true} validationCount={2}>
        Save
      </SaveButton>,
    );
    expect(screen.queryByText("2")).toBeNull();
  });

  it("uses custom savingText when saving", () => {
    render(
      <SaveButton isSaving={true} savingText="Sending...">
        Save
      </SaveButton>,
    );
    // The Button component shows loadingText when loading
    expect(screen.getByText("Sending...")).toBeTruthy();
  });

  it("uses default translation for saving text", () => {
    render(
      <SaveButton isSaving={true}>Save</SaveButton>,
    );
    // t("common.saving") should be shown
    expect(screen.getByText("common.saving")).toBeTruthy();
  });
});
