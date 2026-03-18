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

vi.mock("../../crud/filters/filter-icons", () => ({
  operatorConfig: new Proxy(
    {},
    {
      get: () => ({
        icon: ({ className }: { className?: string }) => (
          <span className={className}>op</span>
        ),
        labelKey: "operator.label",
      }),
    },
  ),
}));

import { AdvancedSelectFilter } from "../../crud/filters/advanced-select-filter";
import { SearchOperator } from "../../crud/filters/filter-types";

const options = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

describe("AdvancedSelectFilter", () => {
  it("renders label", () => {
    render(
      <AdvancedSelectFilter
        label="Status"
        value={[]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    expect(screen.getByText("Status")).toBeTruthy();
  });

  it("renders dashed border when no selection", () => {
    const { container } = render(
      <AdvancedSelectFilter
        label="Status"
        value={[]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const triggerBtn = Array.from(buttons).find((b) => b.className.includes("border-dashed"));
    expect(triggerBtn).toBeTruthy();
  });

  it("renders solid border when selection exists", () => {
    const { container } = render(
      <AdvancedSelectFilter
        label="Status"
        value={["active"]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const triggerBtn = Array.from(buttons).find((b) => b.className.includes("border-solid"));
    expect(triggerBtn).toBeTruthy();
  });

  it("shows clear button when selection exists", () => {
    render(
      <AdvancedSelectFilter
        label="Status"
        value={["active"]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    expect(screen.getByLabelText("filter.clearFilter")).toBeTruthy();
  });

  it("does not show clear button when no selection", () => {
    render(
      <AdvancedSelectFilter
        label="Status"
        value={[]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    expect(screen.queryByLabelText("filter.clearFilter")).toBeNull();
  });

  it("shows operator dropdown when multiple operators", () => {
    render(
      <AdvancedSelectFilter
        label="Status"
        value={[]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN, SearchOperator.NOT_IN]}
        options={options}
      />,
    );
    expect(screen.getByLabelText("filter.selectOperator")).toBeTruthy();
  });

  it("hides operator dropdown when single operator", () => {
    render(
      <AdvancedSelectFilter
        label="Status"
        value={[]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    expect(screen.queryByLabelText("filter.selectOperator")).toBeNull();
  });

  it("renders with single string value", () => {
    const { container } = render(
      <AdvancedSelectFilter
        label="Status"
        value="active"
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
        options={options}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const triggerBtn = Array.from(buttons).find((b) => b.className.includes("border-solid"));
    expect(triggerBtn).toBeTruthy();
  });

  it("shows count when selections exceed maxDisplayCount", () => {
    render(
      <AdvancedSelectFilter
        label="Status"
        value={["active", "draft", "archived"]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
        maxDisplayCount={2}
      />,
    );
    expect(screen.getByText("3 selected")).toBeTruthy();
  });

  it("calls onChange with empty array on clear (multi mode)", () => {
    const onChange = vi.fn();
    render(
      <AdvancedSelectFilter
        label="Status"
        value={["active"]}
        operator={SearchOperator.IN}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("handles keyboard clear with Enter key", () => {
    const onChange = vi.fn();
    render(
      <AdvancedSelectFilter
        label="Status"
        value={["active"]}
        operator={SearchOperator.IN}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearFilter");
    fireEvent.keyDown(clearBtn, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("handles keyboard clear with Space key", () => {
    const onChange = vi.fn();
    render(
      <AdvancedSelectFilter
        label="Status"
        value={["active"]}
        operator={SearchOperator.IN}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearFilter");
    fireEvent.keyDown(clearBtn, { key: " " });
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("shows selected badges within maxDisplayCount", () => {
    render(
      <AdvancedSelectFilter
        label="Status"
        value={["active", "draft"]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
        maxDisplayCount={5}
      />,
    );
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Draft")).toBeTruthy();
  });

  it("uses operator labelKey as default label when no label provided", () => {
    render(
      <AdvancedSelectFilter
        value={[]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
      />,
    );
    // Falls back to t(currentOp.labelKey) = "operator.label"
    expect(screen.getByText("operator.label")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AdvancedSelectFilter
        value={[]}
        operator={SearchOperator.IN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.IN]}
        options={options}
        className="my-filter"
      />,
    );
    expect(container.firstElementChild?.className).toContain("my-filter");
  });
});
