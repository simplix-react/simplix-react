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
      <ChipFilter field="status.in" options={options} state={state} />,
    );
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Inactive")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
  });

  it("chooses an option on click", () => {
    const state = createMockState();
    render(
      <ChipFilter field="status.in" options={options} state={state} />,
    );
    fireEvent.click(screen.getByText("Active"));
    expect(state.commitValue).toHaveBeenCalledWith("status.in", ["active"]);
  });

  it("adds a second option to the narrowing instead of replacing the first", () => {
    const state = createMockState({ "status.in": ["active"] });
    render(
      <ChipFilter field="status.in" options={options} state={state} />,
    );
    fireEvent.click(screen.getByText("Pending"));
    expect(state.commitValue).toHaveBeenCalledWith("status.in", ["active", "pending"]);
  });

  it("drops one value and keeps the rest when a lit chip is pressed", () => {
    const state = createMockState({ "status.in": ["active", "pending"] });
    render(
      <ChipFilter field="status.in" options={options} state={state} />,
    );
    fireEvent.click(screen.getByText("Active"));
    expect(state.commitValue).toHaveBeenCalledWith("status.in", ["pending"]);
  });

  it("clears the field when the last lit chip is pressed", () => {
    const state = createMockState({ "status.in": ["active"] });
    render(
      <ChipFilter field="status.in" options={options} state={state} />,
    );
    fireEvent.click(screen.getByText("Active"));
    expect(state.commitValue).toHaveBeenCalledWith("status.in", undefined);
  });

  it("reads a single seeded value as one chosen chip", () => {
    const state = createMockState({ "status.in": "active" });
    render(
      <ChipFilter field="status.in" options={options} state={state} />,
    );
    expect(screen.getByText("Active").closest("button")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("applies primary style to active chip", () => {
    const state = createMockState({ "status.in": ["active"] });
    render(
      <ChipFilter field="status.in" options={options} state={state} />,
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
      <ChipFilter field="status.in" options={disabledOptions} state={state} />,
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
      <ChipFilter field="status.in" options={optionsWithIcon} state={state} />,
    );
    expect(screen.getByTestId("dot")).toBeTruthy();
  });
});
