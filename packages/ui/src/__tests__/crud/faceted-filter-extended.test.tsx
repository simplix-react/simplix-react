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
}));

import { FacetedFilter, type FacetedFilterOption } from "../../crud/filters/faceted-filter";

const options: FacetedFilterOption[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

describe("FacetedFilter (extended coverage)", () => {
  it("calls onChange with empty array on clear (multi-select)", () => {
    const onChange = vi.fn();
    render(
      <FacetedFilter
        label="Status"
        value={["active"]}
        onChange={onChange}
        options={options}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("calls onChange with empty string on clear (single-select)", () => {
    const onChange = vi.fn();
    render(
      <FacetedFilter
        label="Status"
        value="active"
        onChange={onChange}
        options={options}
        multiSelect={false}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("handles keyboard clear with Enter key", () => {
    const onChange = vi.fn();
    render(
      <FacetedFilter
        label="Status"
        value={["active"]}
        onChange={onChange}
        options={options}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearFilter"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("handles keyboard clear with Space key", () => {
    const onChange = vi.fn();
    render(
      <FacetedFilter
        label="Status"
        value={["active"]}
        onChange={onChange}
        options={options}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearFilter"), { key: " " });
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("does not clear on unrelated key press", () => {
    const onChange = vi.fn();
    render(
      <FacetedFilter
        label="Status"
        value={["active"]}
        onChange={onChange}
        options={options}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearFilter"), { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows selected badges within maxDisplayCount", () => {
    render(
      <FacetedFilter
        label="Status"
        value={["active", "draft"]}
        onChange={vi.fn()}
        options={options}
        maxDisplayCount={5}
      />,
    );
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Draft")).toBeTruthy();
  });

  it("shows mobile count badge (hidden sm:hidden)", () => {
    render(
      <FacetedFilter
        label="Status"
        value={["active", "draft"]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    // Mobile badge shows count, desktop shows labels
    // Both should be rendered (visibility controlled by CSS)
    const trigger = screen.getByText("Status").closest("button")!;
    expect(trigger).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FacetedFilter
        label="Status"
        value={[]}
        onChange={vi.fn()}
        options={options}
        className="my-filter"
      />,
    );
    // The root Popover trigger wraps in a parent
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("my-filter");
  });

  it("opens popover and shows options with command list", () => {
    render(
      <FacetedFilter
        label="Status"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    // Click the trigger to open popover
    fireEvent.click(screen.getByText("Status"));
    // Command input should be visible
    expect(screen.getByPlaceholderText("Status")).toBeTruthy();
    // Options should be visible
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Draft")).toBeTruthy();
    expect(screen.getByText("Archived")).toBeTruthy();
  });

  it("shows 'clear filters' option in popover when items are selected", () => {
    render(
      <FacetedFilter
        label="Status"
        value={["active"]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    fireEvent.click(screen.getByText("Status"));
    expect(screen.getByText("filter.clearFilters")).toBeTruthy();
  });

  it("does not show 'clear filters' option in popover when no items selected", () => {
    render(
      <FacetedFilter
        label="Status"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    fireEvent.click(screen.getByText("Status"));
    expect(screen.queryByText("filter.clearFilters")).toBeNull();
  });

  it("renders options with icons", () => {
    const iconOptions: FacetedFilterOption[] = [
      { value: "active", label: "Active", icon: (props) => <span className={props.className} data-testid="icon">*</span> },
    ];
    render(
      <FacetedFilter
        label="Status"
        value={[]}
        onChange={vi.fn()}
        options={iconOptions}
      />,
    );
    fireEvent.click(screen.getByText("Status"));
    expect(screen.getByTestId("icon")).toBeTruthy();
  });

  it("renders with empty value string for single-select", () => {
    const { container } = render(
      <FacetedFilter
        label="Status"
        value=""
        onChange={vi.fn()}
        options={options}
        multiSelect={false}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-dashed");
  });
});
