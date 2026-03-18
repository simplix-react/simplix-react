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

// Mock country/timezone form fields since they have separate tests
vi.mock("../../crud/filters/country-form-field", () => ({
  CountryFormField: ({ label }: { label: string }) => <div data-testid="country-field">{label}</div>,
}));
vi.mock("../../crud/filters/timezone-form-field", () => ({
  TimezoneFormField: ({ label }: { label: string }) => <div data-testid="timezone-field">{label}</div>,
}));

import React from "react";
import type { CrudListFilters } from "../../crud/list/use-crud-list";
import { FilterBar, type FilterDef } from "../../crud/filters/filter-bar";
import { SearchOperator } from "../../crud/filters/filter-types";

function createMockState(
  values: Record<string, unknown> = {},
  committedValues?: Record<string, unknown>,
  isPending = false,
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
    isPending,
  };
}

describe("FilterBar popover form fields", () => {
  const textFilter: FilterDef = {
    type: "text",
    field: "name",
    label: "Name",
    operators: [SearchOperator.CONTAINS, SearchOperator.EQUALS],
    defaultOperator: SearchOperator.CONTAINS,
    placeholder: "Search name...",
  };

  const numberFilter: FilterDef = {
    type: "number",
    field: "age",
    label: "Age",
    operators: [SearchOperator.EQUALS, SearchOperator.GREATER_THAN],
    defaultOperator: SearchOperator.EQUALS,
  };

  const facetedFilter: FilterDef = {
    type: "faceted",
    field: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  };

  const toggleFilter: FilterDef = {
    type: "toggle",
    field: "enabled",
    label: "Enabled",
  };

  const dateRangeFilter: FilterDef = {
    type: "dateRange",
    field: "createdAt",
    label: "Created",
  };

  const countryFilter: FilterDef = {
    type: "country",
    field: "country",
    label: "Country",
  };

  const timezoneFilter: FilterDef = {
    type: "timezone",
    field: "timezone",
    label: "Timezone",
  };

  function openPopover() {
    const filterBtn = screen.getByText("filter.label").closest("button");
    if (filterBtn) fireEvent.click(filterBtn);
  }

  it("opens popover when filter button is clicked", () => {
    const state = createMockState();
    render(
      <FilterBar
        filters={[textFilter]}
        state={state}
      />,
    );
    openPopover();
    // Popover should show the filter form
    expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
  });

  it("renders text field in popover with placeholder", () => {
    const state = createMockState();
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    expect(screen.getByPlaceholderText("Search name...")).toBeTruthy();
  });

  it("renders text field value from state", () => {
    const state = createMockState({ "name.contains": "hello" });
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    const input = screen.getByPlaceholderText("Search name...") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("calls setValue when text input changes", () => {
    const state = createMockState();
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    const input = screen.getByPlaceholderText("Search name...");
    fireEvent.change(input, { target: { value: "test" } });
    expect(state.setValue).toHaveBeenCalledWith("name.contains", "test");
  });

  it("clears text value when input is emptied", () => {
    const state = createMockState({ "name.contains": "hello" });
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    const input = screen.getByPlaceholderText("Search name...");
    fireEvent.change(input, { target: { value: "" } });
    expect(state.setValue).toHaveBeenCalledWith("name.contains", undefined);
  });

  it("renders number field in popover", () => {
    const state = createMockState();
    render(<FilterBar filters={[numberFilter]} state={state} />);
    openPopover();
    const input = screen.getByPlaceholderText("Age") as HTMLInputElement;
    expect(input.type).toBe("number");
  });

  it("calls setValue with number when valid number is entered", () => {
    const state = createMockState();
    render(<FilterBar filters={[numberFilter]} state={state} />);
    openPopover();
    const input = screen.getByPlaceholderText("Age");
    fireEvent.change(input, { target: { value: "25" } });
    expect(state.setValue).toHaveBeenCalledWith("age.equals", 25);
  });

  it("does not call setValue with NaN", () => {
    const state = createMockState();
    render(<FilterBar filters={[numberFilter]} state={state} />);
    openPopover();
    const input = screen.getByPlaceholderText("Age");
    fireEvent.change(input, { target: { value: "abc" } });
    // setValue should not be called with NaN
    expect(state.setValue).not.toHaveBeenCalledWith("age.equals", NaN);
  });

  it("clears number value when input is emptied", () => {
    const state = createMockState({ "age.equals": 25 });
    render(<FilterBar filters={[numberFilter]} state={state} />);
    openPopover();
    const input = screen.getByPlaceholderText("Age");
    fireEvent.change(input, { target: { value: "" } });
    expect(state.setValue).toHaveBeenCalledWith("age.equals", undefined);
  });

  it("renders faceted filter with options", () => {
    const state = createMockState();
    render(<FilterBar filters={[facetedFilter]} state={state} />);
    openPopover();
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Inactive")).toBeTruthy();
  });

  it("selects faceted option on click", () => {
    const state = createMockState();
    render(<FilterBar filters={[facetedFilter]} state={state} />);
    openPopover();
    fireEvent.click(screen.getByText("Active"));
    expect(state.setValue).toHaveBeenCalledWith("status.in", ["active"]);
  });

  it("deselects faceted option when already selected", () => {
    const state = createMockState({ "status.in": ["active"] });
    render(<FilterBar filters={[facetedFilter]} state={state} />);
    openPopover();
    // "Active" appears in both the badge and the command list; click the one in CommandItem
    const allActive = screen.getAllByText("Active");
    // Click the last one (inside CommandItem, not the badge)
    fireEvent.click(allActive[allActive.length - 1]);
    expect(state.setValue).toHaveBeenCalledWith("status.in", undefined);
  });

  it("renders toggle filter with switch", () => {
    const state = createMockState();
    render(<FilterBar filters={[toggleFilter]} state={state} />);
    openPopover();
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeTruthy();
  });

  it("calls setValue on toggle switch change", () => {
    const state = createMockState();
    render(<FilterBar filters={[toggleFilter]} state={state} />);
    openPopover();
    const switchEl = screen.getByRole("switch");
    fireEvent.click(switchEl);
    expect(state.setValue).toHaveBeenCalledWith("enabled.equals", true);
  });

  it("renders clear and apply buttons in popover", () => {
    const state = createMockState({}, {}, true);
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    expect(screen.getByText("common.clear")).toBeTruthy();
    expect(screen.getByText("filter.apply")).toBeTruthy();
  });

  it("calls state.apply and closes popover on apply", () => {
    const state = createMockState({ "name.contains": "test" }, {}, true);
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    fireEvent.click(screen.getByText("filter.apply"));
    expect(state.apply).toHaveBeenCalledTimes(1);
  });

  it("calls state.clear on clear button click", () => {
    const state = createMockState({ "name.contains": "test" }, { "name.contains": "test" });
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    fireEvent.click(screen.getByText("common.clear"));
    expect(state.clear).toHaveBeenCalledTimes(1);
  });

  it("renders country form field in popover", () => {
    const state = createMockState();
    render(<FilterBar filters={[countryFilter]} state={state} />);
    openPopover();
    expect(screen.getByTestId("country-field")).toBeTruthy();
  });

  it("renders timezone form field in popover", () => {
    const state = createMockState();
    render(<FilterBar filters={[timezoneFilter]} state={state} />);
    openPopover();
    expect(screen.getByTestId("timezone-field")).toBeTruthy();
  });

  it("renders multiple filter fields in popover", () => {
    const state = createMockState();
    render(
      <FilterBar
        filters={[textFilter, numberFilter, toggleFilter, facetedFilter]}
        state={state}
      />,
    );
    openPopover();
    // All filter labels should be present
    const nameLabels = screen.getAllByText("Name");
    expect(nameLabels.length).toBeGreaterThan(0);
    expect(screen.getByText("Age")).toBeTruthy();
    expect(screen.getByText("Enabled")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
  });

  it("shows clear button for text field when value exists", () => {
    const state = createMockState({ "name.contains": "hello" });
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    expect(screen.getByLabelText("Clear Name")).toBeTruthy();
  });

  it("shows clear button for number field when value exists", () => {
    const state = createMockState({ "age.equals": 25 });
    render(<FilterBar filters={[numberFilter]} state={state} />);
    openPopover();
    expect(screen.getByLabelText("Clear Age")).toBeTruthy();
  });

  it("shows clear button for toggle when active", () => {
    const state = createMockState({ "enabled.equals": true });
    render(<FilterBar filters={[toggleFilter]} state={state} />);
    openPopover();
    expect(screen.getByLabelText("Clear Enabled")).toBeTruthy();
  });

  it("shows clear button for faceted when items selected", () => {
    const state = createMockState({ "status.in": ["active"] });
    render(<FilterBar filters={[facetedFilter]} state={state} />);
    openPopover();
    expect(screen.getByLabelText("Clear Status")).toBeTruthy();
  });

  it("clears faceted selection via clear button", () => {
    const state = createMockState({ "status.in": ["active"] });
    render(<FilterBar filters={[facetedFilter]} state={state} />);
    openPopover();
    fireEvent.click(screen.getByLabelText("Clear Status"));
    expect(state.setValue).toHaveBeenCalledWith("status.in", undefined);
  });

  it("clears toggle value via clear button", () => {
    const state = createMockState({ "enabled.equals": true });
    render(<FilterBar filters={[toggleFilter]} state={state} />);
    openPopover();
    fireEvent.click(screen.getByLabelText("Clear Enabled"));
    expect(state.setValue).toHaveBeenCalledWith("enabled.equals", undefined);
  });

  it("clears text field via clear button", () => {
    const state = createMockState({ "name.contains": "hello" });
    render(<FilterBar filters={[textFilter]} state={state} />);
    openPopover();
    fireEvent.click(screen.getByLabelText("Clear Name"));
    expect(state.setValue).toHaveBeenCalledWith("name.contains", undefined);
  });

  it("clears number field via clear button", () => {
    const state = createMockState({ "age.equals": 25 });
    render(<FilterBar filters={[numberFilter]} state={state} />);
    openPopover();
    fireEvent.click(screen.getByLabelText("Clear Age"));
    expect(state.setValue).toHaveBeenCalledWith("age.equals", undefined);
  });

  it("renders dateRange form field with calendar", () => {
    const state = createMockState();
    render(<FilterBar filters={[dateRangeFilter]} state={state} />);
    openPopover();
    // The dateRange field renders a Calendar component
    expect(screen.getByText("Created")).toBeTruthy();
  });

  it("shows range text when dateRange has values", () => {
    const gteKey = "createdAt.greaterThanOrEqualTo";
    const lteKey = "createdAt.lessThanOrEqualTo";
    const state = createMockState({
      [gteKey]: "2024-01-01T00:00:00.000Z",
      [lteKey]: "2024-12-31T00:00:00.000Z",
    });
    render(<FilterBar filters={[dateRangeFilter]} state={state} />);
    openPopover();
    // Should show a clear button for the dateRange
    expect(screen.getByLabelText("Clear Created")).toBeTruthy();
  });

  it("clears dateRange via clear button", () => {
    const gteKey = "createdAt.greaterThanOrEqualTo";
    const lteKey = "createdAt.lessThanOrEqualTo";
    const state = createMockState({
      [gteKey]: "2024-01-01T00:00:00.000Z",
      [lteKey]: "2024-12-31T00:00:00.000Z",
    });
    render(<FilterBar filters={[dateRangeFilter]} state={state} />);
    openPopover();
    fireEvent.click(screen.getByLabelText("Clear Created"));
    expect(state.setValues).toHaveBeenCalledWith({
      [gteKey]: undefined,
      [lteKey]: undefined,
    });
  });

  it("renders empty options message for faceted filter with no options", () => {
    const emptyFaceted: FilterDef = {
      type: "faceted",
      field: "tags",
      label: "Tags",
      options: [],
    };
    const state = createMockState();
    render(<FilterBar filters={[emptyFaceted]} state={state} />);
    openPopover();
    expect(screen.getByText("No options available")).toBeTruthy();
  });
});
