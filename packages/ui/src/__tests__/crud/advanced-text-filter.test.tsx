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

import { AdvancedTextFilter } from "../../crud/filters/advanced-text-filter";
import { SearchOperator } from "../../crud/filters/filter-types";

describe("AdvancedTextFilter", () => {
  it("renders with label as aria-label", () => {
    render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    expect(screen.getByLabelText("Name")).toBeTruthy();
  });

  it("displays current value", () => {
    render(
      <AdvancedTextFilter
        label="Name"
        value="hello"
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("shows clear button when value is non-empty", () => {
    render(
      <AdvancedTextFilter
        label="Name"
        value="test"
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    expect(screen.getByLabelText("filter.clearFilter")).toBeTruthy();
  });

  it("hides clear button when value is empty", () => {
    render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    expect(screen.queryByLabelText("filter.clearFilter")).toBeNull();
  });

  it("calls onChange with empty string when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <AdvancedTextFilter
        label="Name"
        value="test"
        operator={SearchOperator.CONTAINS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows operator dropdown when multiple operators", () => {
    render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS, SearchOperator.EQUALS]}
      />,
    );
    expect(screen.getByLabelText("filter.selectOperator")).toBeTruthy();
  });

  it("hides operator dropdown when single operator", () => {
    render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    expect(screen.queryByLabelText("filter.selectOperator")).toBeNull();
  });

  it("uses custom placeholder", () => {
    render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
        placeholder="Type name..."
      />,
    );
    expect(screen.getByPlaceholderText("Type name...")).toBeTruthy();
  });
});
