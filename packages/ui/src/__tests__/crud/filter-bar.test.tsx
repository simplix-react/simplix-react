// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.count !== undefined) return `${opts.count} selected`;
      return key;
    },
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
}));

// Mock column context
vi.mock("../../crud/shared/column-context", () => ({
  useCrudListColumns: () => null,
}));

// Mock filter-icons
vi.mock("../../crud/filters/filter-icons", () => ({
  operatorConfig: new Proxy(
    {},
    {
      get: () => ({
        icon: ({ className }: { className?: string }) => (
          <span className={className}>op-icon</span>
        ),
        labelKey: "operator.label",
      }),
    },
  ),
}));

import React from "react";
import type { CrudListFilters } from "../../crud/list/use-crud-list";
import { FilterBar, type FilterDef } from "../../crud/filters/filter-bar";
import { SearchOperator } from "../../crud/filters/filter-types";

function createMockState(
  values: Record<string, unknown> = {},
  committedValues?: Record<string, unknown>,
): CrudListFilters {
  return {
    search: "",
    values,
    committedValues: committedValues ?? values,
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

describe("FilterBar", () => {
  const textFilter: FilterDef = {
    type: "text",
    field: "name",
    label: "Name",
    operators: [SearchOperator.CONTAINS],
    defaultOperator: SearchOperator.CONTAINS,
  };

  const toggleFilter: FilterDef = {
    type: "toggle",
    field: "active",
    label: "Active",
  };

  it("renders the filter button", () => {
    const state = createMockState();
    render(<FilterBar filters={[textFilter]} state={state} />);
    expect(screen.getByText("filter.label")).toBeTruthy();
  });

  it("renders leading content", () => {
    const state = createMockState();
    render(
      <FilterBar
        filters={[textFilter]}
        state={state}
        leading={<span>Leading Content</span>}
      />,
    );
    expect(screen.getByText("Leading Content")).toBeTruthy();
  });

  it("shows active filter count badge when filters are active", () => {
    const state = createMockState(
      { "name.contains": "test" },
      { "name.contains": "test" },
    );
    render(<FilterBar filters={[textFilter]} state={state} />);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("shows filter badge with value for active text filter", () => {
    const state = createMockState(
      { "name.contains": "hello" },
      { "name.contains": "hello" },
    );
    render(<FilterBar filters={[textFilter]} state={state} />);
    // Badge text should show the filter value
    expect(screen.getByText("hello")).toBeTruthy();
    expect(screen.getByText("Name:")).toBeTruthy();
  });

  it("shows remove button on active filter badge", () => {
    const state = createMockState(
      { "name.contains": "hello" },
      { "name.contains": "hello" },
    );
    render(<FilterBar filters={[textFilter]} state={state} />);
    const removeBtn = screen.getByLabelText("Remove Name filter");
    expect(removeBtn).toBeTruthy();
  });

  it("removes filter when badge remove button is clicked", () => {
    const state = createMockState(
      { "name.contains": "hello" },
      { "name.contains": "hello" },
    );
    render(<FilterBar filters={[textFilter]} state={state} />);
    fireEvent.click(screen.getByLabelText("Remove Name filter"));
    expect(state.commitValue).toHaveBeenCalledWith("name.contains", undefined);
  });

  it("shows toggle filter badge when active", () => {
    const state = createMockState(
      { "active.equals": true },
      { "active.equals": true },
    );
    render(<FilterBar filters={[toggleFilter]} state={state} />);
    expect(screen.getByText("Active:")).toBeTruthy();
    expect(screen.getByText("common.yes")).toBeTruthy();
  });

  it("limits visible badges to maxBadges and shows +N", () => {
    const filters: FilterDef[] = [
      { type: "text", field: "f1", label: "F1", operators: [SearchOperator.CONTAINS], defaultOperator: SearchOperator.CONTAINS },
      { type: "text", field: "f2", label: "F2", operators: [SearchOperator.CONTAINS], defaultOperator: SearchOperator.CONTAINS },
      { type: "text", field: "f3", label: "F3", operators: [SearchOperator.CONTAINS], defaultOperator: SearchOperator.CONTAINS },
    ];
    const vals = { "f1.contains": "a", "f2.contains": "b", "f3.contains": "c" };
    const state = createMockState(vals, vals);
    render(<FilterBar filters={filters} state={state} maxBadges={2} />);
    expect(screen.getByText("+1")).toBeTruthy();
  });

  it("applies custom className", () => {
    const state = createMockState();
    const { container } = render(
      <FilterBar filters={[textFilter]} state={state} className="my-bar" />,
    );
    expect(container.firstElementChild?.className).toContain("my-bar");
  });
});
