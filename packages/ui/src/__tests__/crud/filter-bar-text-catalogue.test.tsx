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

vi.mock("../../crud/shared/column-context", () => ({
  useCrudListColumns: () => null,
}));

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

import { SearchOperator } from "@simplix-react/headless";

import type { CrudListFilters } from "../../crud/list/use-crud-list";
import { FilterBar, type TextFilterDef } from "../../crud/filters/filter-bar";

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

function openPopover() {
  fireEvent.click(screen.getByRole("button", { name: "filter.label" }));
}

function catalogueFilter(overrides: Partial<TextFilterDef> = {}): TextFilterDef {
  return {
    type: "text",
    field: "features",
    label: "Modules",
    operators: [SearchOperator.CONTAINS],
    defaultOperator: SearchOperator.CONTAINS,
    options: [
      { value: "ATTENDANCE", label: "Attendance" },
      { value: "VISITOR", label: "Visitors" },
    ],
    ...overrides,
  };
}

describe("FilterBar text filter — closed catalogue", () => {
  it("offers a picker instead of a free-text box when options are supplied", () => {
    render(<FilterBar filters={[catalogueFilter()]} state={createMockState()} />);
    openPopover();

    expect(screen.queryByPlaceholderText("Modules")).toBeNull();
    expect(screen.getByRole("combobox", { name: "Modules" })).toBeTruthy();
  });

  it("names the active-filter badge from the catalogue, not the stored key", () => {
    render(
      <FilterBar
        filters={[catalogueFilter()]}
        state={createMockState({ "features.contains": "ATTENDANCE" })}
        maxBadges={3}
      />,
    );

    expect(screen.queryByText("ATTENDANCE")).toBeNull();
    expect(screen.getAllByText("Attendance").length).toBeGreaterThanOrEqual(1);
  });

  it("falls back to the raw value for a stored key the catalogue no longer offers", () => {
    render(
      <FilterBar
        filters={[catalogueFilter()]}
        state={createMockState({ "features.contains": "RETIRED_MODULE" })}
        maxBadges={3}
      />,
    );

    expect(screen.getAllByText("RETIRED_MODULE").length).toBeGreaterThanOrEqual(1);
  });

  it("keeps the free-text box when no catalogue is supplied", () => {
    render(
      <FilterBar
        filters={[catalogueFilter({ options: undefined })]}
        state={createMockState()}
      />,
    );
    openPopover();

    const input = screen.getByPlaceholderText("Modules");
    fireEvent.change(input, { target: { value: "vis" } });
    expect(input).toBeTruthy();
  });
});
