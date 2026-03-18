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

import { UnifiedTextFilter } from "../../crud/filters/unified-text-filter";
import { SearchOperator } from "../../crud/filters/filter-types";

const fields = [
  { field: "name", label: "Name", operators: [SearchOperator.CONTAINS, SearchOperator.EQUALS], defaultOperator: SearchOperator.CONTAINS },
  { field: "code", label: "Code", operators: [SearchOperator.EQUALS] },
];

describe("UnifiedTextFilter", () => {
  it("renders with active field label as aria-label", () => {
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value=""
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Name")).toBeTruthy();
  });

  it("displays current value", () => {
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value="hello"
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value=""
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={onChange}
        onOperatorChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("shows clear button when value is non-empty", () => {
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value="test"
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("filter.clearFilter")).toBeTruthy();
  });

  it("hides clear button when value is empty", () => {
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value=""
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("filter.clearFilter")).toBeNull();
  });

  it("calls onChange with empty string when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value="test"
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={onChange}
        onOperatorChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows field label in field selector", () => {
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value=""
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Name")).toBeTruthy();
  });

  it("shows operator selector when multiple operators", () => {
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value=""
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("filter.selectOperator")).toBeTruthy();
  });

  it("hides operator selector when single operator", () => {
    render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="code"
        value=""
        operator={SearchOperator.EQUALS}
        onFieldChange={vi.fn()}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("filter.selectOperator")).toBeNull();
  });

  it("applies custom width", () => {
    const { container } = render(
      <UnifiedTextFilter
        fields={fields}
        selectedField="name"
        value=""
        operator={SearchOperator.CONTAINS}
        onFieldChange={vi.fn()}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        width={400}
      />,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.width).toBe("400px");
  });
});
