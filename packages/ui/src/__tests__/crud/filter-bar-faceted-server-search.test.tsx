// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

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

import type { CrudListFilters } from "../../crud/list/use-crud-list";
import { FilterBar, type FacetedFilterDef } from "../../crud/filters/filter-bar";

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

function openPopover() {
  fireEvent.click(screen.getByRole("button", { name: "filter.label" }));
}

function openDropdown(label = "Customer") {
  // The dropdown trigger carries the filter label as its accessible name; its text
  // is the placeholder while nothing is selected and the joined labels once it is.
  fireEvent.click(screen.getByRole("button", { name: label }));
}

describe("FilterBar faceted filter — server search", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function serverFacet(overrides: Partial<FacetedFilterDef> = {}): FacetedFilterDef {
    return {
      type: "faceted",
      field: "customerId",
      label: "Customer",
      display: "dropdown",
      options: [{ value: "c1", label: "Acme" }],
      onSearch: vi.fn(),
      ...overrides,
    };
  }

  it("debounces the typed query before handing it to onSearch", () => {
    const onSearch = vi.fn();
    const def = serverFacet({ onSearch });
    render(<FilterBar filters={[def]} state={createMockState()} />);
    openPopover();
    openDropdown();

    // The mount effect fires once with the empty query.
    act(() => {
      vi.advanceTimersByTime(300);
    });
    onSearch.mockClear();

    const input = screen.getByPlaceholderText("Customer");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ac" } });
    fireEvent.change(input, { target: { value: "acm" } });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("acm");
  });

  it("honours a custom searchDebounceMs", () => {
    const onSearch = vi.fn();
    render(
      <FilterBar
        filters={[serverFacet({ onSearch, searchDebounceMs: 50 })]}
        state={createMockState()}
      />,
    );
    openPopover();
    openDropdown();
    act(() => {
      vi.advanceTimersByTime(50);
    });
    onSearch.mockClear();

    fireEvent.change(screen.getByPlaceholderText("Customer"), { target: { value: "x" } });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(onSearch).toHaveBeenCalledWith("x");
  });

  it("renders the server's page as-is instead of filtering it locally", () => {
    // "Globex" does not contain the typed text; a locally filtered list would drop it.
    render(
      <FilterBar
        filters={[
          serverFacet({
            options: [
              { value: "c1", label: "Acme" },
              { value: "c2", label: "Globex" },
            ],
          }),
        ]}
        state={createMockState()}
      />,
    );
    openPopover();
    openDropdown();
    fireEvent.change(screen.getByPlaceholderText("Customer"), { target: { value: "zzz" } });

    expect(screen.getByText("Acme")).toBeTruthy();
    expect(screen.getByText("Globex")).toBeTruthy();
  });

  it("shows a pending row while the search is in flight", () => {
    render(
      <FilterBar filters={[serverFacet({ loading: true })]} state={createMockState()} />,
    );
    openPopover();
    openDropdown();
    expect(screen.getByText("common.loading")).toBeTruthy();
  });

  it("shows the empty-result message when the search comes back with nothing", () => {
    render(
      <FilterBar
        filters={[serverFacet({ options: [], loading: false })]}
        state={createMockState()}
      />,
    );
    openPopover();
    openDropdown();
    expect(screen.getByText("filter.noResultsFound")).toBeTruthy();
  });

  it("keeps a selected value's label when it is absent from the current page", () => {
    const def = serverFacet({
      // The current page no longer holds the selected customer.
      options: [{ value: "c9", label: "Initech" }],
      selectedOptions: [{ value: "c1", label: "Acme" }],
    });
    render(
      <FilterBar filters={[def]} state={createMockState({ "customerId.in": ["c1"] })} />,
    );
    openPopover();

    // The trigger keeps the name.
    expect(screen.getAllByText("Acme").length).toBeGreaterThanOrEqual(1);

    openDropdown();
    // …and the selected row is pinned into the list so it can be unselected.
    expect(screen.getAllByText("Acme").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Initech")).toBeTruthy();
  });

  it("names the active-filter badge from selectedOptions", () => {
    const def = serverFacet({
      options: [{ value: "c9", label: "Initech" }],
      selectedOptions: [{ value: "c1", label: "Acme" }],
    });
    render(
      <FilterBar
        filters={[def]}
        state={createMockState({ "customerId.in": ["c1"] })}
        maxBadges={3}
      />,
    );
    // Without the fallback the badge would print the raw id.
    expect(screen.queryByText("c1")).toBeNull();
    expect(screen.getAllByText("Acme").length).toBeGreaterThanOrEqual(1);
  });

  it("writes the picked value to the filter state", () => {
    const state = createMockState();
    render(<FilterBar filters={[serverFacet()]} state={state} />);
    openPopover();
    openDropdown();
    fireEvent.click(screen.getByText("Acme"));
    expect(state.setValue).toHaveBeenCalledWith("customerId.in", ["c1"]);
  });

  it("leaves an eager faceted filter untouched — no onSearch, local filtering kept", () => {
    const eager: FacetedFilterDef = {
      type: "faceted",
      field: "status",
      label: "Status",
      display: "dropdown",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    };
    render(<FilterBar filters={[eager]} state={createMockState()} />);
    openPopover();
    openDropdown("Status");
    fireEvent.change(screen.getByPlaceholderText("Status"), { target: { value: "inact" } });

    expect(screen.getByText("Inactive")).toBeTruthy();
    expect(screen.queryByText("Active")).toBeNull();
  });

  it("renders the inline list variant for a server-searched facet with no options yet", () => {
    render(
      <FilterBar
        filters={[serverFacet({ display: undefined, options: [] })]}
        state={createMockState()}
      />,
    );
    openPopover();
    // The eager "nothing to pick" notice must not replace the search input.
    expect(screen.queryByText("filter.noOptions")).toBeNull();
    expect(screen.getByPlaceholderText("Customer")).toBeTruthy();
  });
});
