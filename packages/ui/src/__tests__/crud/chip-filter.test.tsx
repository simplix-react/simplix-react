// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

import { ChipFilter } from "../../crud/filters/chip-filter";
import type { CrudListFilters } from "../../crud/list/use-crud-list";

function createMockState(values: Record<string, unknown> = {}): CrudListFilters {
  return {
    search: "",
    values,
    committedValues: values,
    setSearch: vi.fn(),
    setValue: vi.fn(),
    setValues: vi.fn(),
    commitValue: vi.fn(),
    commitValues: vi.fn(),
    setAll: vi.fn(),
    clear: vi.fn(),
    apply: vi.fn(),
    isPending: false,
  };
}

describe("ChipFilter", () => {
  const options = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ];

  it("renders all options as buttons", () => {
    const state = createMockState();
    render(
      <ChipFilter field="status.equals" options={options} state={state} />,
    );
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Inactive")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
  });

  it("selects an option on click", () => {
    const state = createMockState();
    render(
      <ChipFilter field="status.equals" options={options} state={state} />,
    );
    fireEvent.click(screen.getByText("Active"));
    expect(state.setAll).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ "status.equals": "active" }),
      }),
    );
  });

  it("deselects when clicking active option", () => {
    const state = createMockState({ "status.equals": "active" });
    render(
      <ChipFilter field="status.equals" options={options} state={state} />,
    );
    fireEvent.click(screen.getByText("Active"));
    expect(state.setAll).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ "status.equals": undefined }),
      }),
    );
  });

  it("applies primary style to active chip", () => {
    const state = createMockState({ "status.equals": "active" });
    render(
      <ChipFilter field="status.equals" options={options} state={state} />,
    );
    const activeBtn = screen.getByText("Active").closest("button");
    expect(activeBtn?.className).toContain("bg-primary");
  });

  it("renders disabled option with disabled style", () => {
    const disabledOptions = [
      { value: "active", label: "Active" },
      { value: "disabled", label: "Disabled", disabled: true },
    ];
    const state = createMockState();
    render(
      <ChipFilter field="status.equals" options={disabledOptions} state={state} />,
    );
    const disabledBtn = screen.getByText("Disabled").closest("button");
    expect(disabledBtn).toHaveProperty("disabled", true);
  });

  it("renders with icon in option", () => {
    const optionsWithIcon = [
      { value: "active", label: "Active", icon: <span data-testid="dot" /> },
    ];
    const state = createMockState();
    render(
      <ChipFilter field="status.equals" options={optionsWithIcon} state={state} />,
    );
    expect(screen.getByTestId("dot")).toBeTruthy();
  });
});
