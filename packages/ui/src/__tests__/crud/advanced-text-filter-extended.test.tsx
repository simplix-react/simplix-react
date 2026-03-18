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
      get: (_target: unknown, prop: string) => ({
        icon: (props: { className?: string }) => (
          <span className={props.className} data-testid={`op-icon-${prop}`}>op</span>
        ),
        labelKey: `operator.${prop}`,
      }),
    },
  ),
}));

import { AdvancedTextFilter } from "../../crud/filters/advanced-text-filter";
import { SearchOperator } from "../../crud/filters/filter-types";

describe("AdvancedTextFilter (extended coverage)", () => {
  it("resets operator to defaultOperator on clear when operator differs", () => {
    const onOperatorChange = vi.fn();
    const onChange = vi.fn();
    render(
      <AdvancedTextFilter
        label="Name"
        value="test"
        operator={SearchOperator.EQUALS}
        onChange={onChange}
        onOperatorChange={onOperatorChange}
        operators={[SearchOperator.CONTAINS, SearchOperator.EQUALS]}
        defaultOperator={SearchOperator.CONTAINS}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith("");
    expect(onOperatorChange).toHaveBeenCalledWith(SearchOperator.CONTAINS);
  });

  it("does not reset operator on clear when already at defaultOperator", () => {
    const onOperatorChange = vi.fn();
    render(
      <AdvancedTextFilter
        label="Name"
        value="test"
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={onOperatorChange}
        operators={[SearchOperator.CONTAINS, SearchOperator.EQUALS]}
        defaultOperator={SearchOperator.CONTAINS}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onOperatorChange).not.toHaveBeenCalled();
  });

  it("does not reset operator on clear when no defaultOperator", () => {
    const onOperatorChange = vi.fn();
    render(
      <AdvancedTextFilter
        label="Name"
        value="test"
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={onOperatorChange}
        operators={[SearchOperator.CONTAINS, SearchOperator.EQUALS]}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onOperatorChange).not.toHaveBeenCalled();
  });

  it("renders single operator icon without dropdown", () => {
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
    // Should have icon span but not dropdown trigger
    expect(screen.queryByLabelText("filter.selectOperator")).toBeNull();
    expect(screen.getByTestId(`op-icon-${SearchOperator.CONTAINS}`)).toBeTruthy();
  });

  it("uses label as fallback placeholder", () => {
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
    expect(screen.getByPlaceholderText("Name")).toBeTruthy();
  });

  it("uses operator labelKey as fallback when no label", () => {
    render(
      <AdvancedTextFilter
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    expect(screen.getByPlaceholderText(`operator.${SearchOperator.CONTAINS}`)).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
        className="my-filter"
      />,
    );
    expect(container.firstElementChild?.className).toContain("my-filter");
  });

  it("renders with larger left padding when multiple operators", () => {
    const { container } = render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS, SearchOperator.EQUALS]}
      />,
    );
    const input = container.querySelector("input");
    expect(input?.className).toContain("pl-14");
  });

  it("renders with smaller left padding when single operator", () => {
    const { container } = render(
      <AdvancedTextFilter
        label="Name"
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    const input = container.querySelector("input");
    expect(input?.className).toContain("pl-8");
  });

  it("renders operator dropdown trigger when multiple operators", () => {
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

  it("uses aria-label from operator labelKey when no label provided", () => {
    render(
      <AdvancedTextFilter
        value=""
        operator={SearchOperator.CONTAINS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.CONTAINS]}
      />,
    );
    expect(screen.getByLabelText(`operator.${SearchOperator.CONTAINS}`)).toBeTruthy();
  });
});
