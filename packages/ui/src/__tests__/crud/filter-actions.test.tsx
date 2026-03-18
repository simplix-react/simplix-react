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

import { FilterActions } from "../../crud/filters/filter-actions";

describe("FilterActions", () => {
  it("renders apply button", () => {
    render(
      <FilterActions
        onClear={vi.fn()}
        hasActiveFilters={false}
        onApply={vi.fn()}
        isPending={true}
      />,
    );
    expect(screen.getByText("common.search")).toBeTruthy();
  });

  it("shows clear button when hasActiveFilters is true", () => {
    render(
      <FilterActions
        onClear={vi.fn()}
        hasActiveFilters={true}
        clearLabel="Clear"
      />,
    );
    expect(screen.getByLabelText("Clear")).toBeTruthy();
  });

  it("hides clear button when hasActiveFilters is false", () => {
    render(
      <FilterActions
        onClear={vi.fn()}
        hasActiveFilters={false}
        clearLabel="Clear"
      />,
    );
    expect(screen.queryByLabelText("Clear")).toBeNull();
  });

  it("calls onClear when clear button is clicked", () => {
    const onClear = vi.fn();
    render(
      <FilterActions
        onClear={onClear}
        hasActiveFilters={true}
        clearLabel="Clear"
      />,
    );
    fireEvent.click(screen.getByLabelText("Clear"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("calls onApply when apply button is clicked", () => {
    const onApply = vi.fn();
    render(
      <FilterActions
        onClear={vi.fn()}
        hasActiveFilters={false}
        onApply={onApply}
        isPending={true}
      />,
    );
    fireEvent.click(screen.getByText("common.search"));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("disables apply button when isPending is false", () => {
    render(
      <FilterActions
        onClear={vi.fn()}
        hasActiveFilters={false}
        onApply={vi.fn()}
        isPending={false}
      />,
    );
    const applyBtn = screen.getByText("common.search").closest("button");
    expect(applyBtn).toHaveProperty("disabled", true);
  });

  it("uses custom labels", () => {
    render(
      <FilterActions
        onClear={vi.fn()}
        hasActiveFilters={true}
        onApply={vi.fn()}
        isPending={true}
        clearLabel="Reset"
        applyLabel="Search now"
      />,
    );
    expect(screen.getByLabelText("Reset")).toBeTruthy();
    expect(screen.getByText("Search now")).toBeTruthy();
  });
});
