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

// Mock filter-icons to return a simple component
vi.mock("../../crud/filters/filter-icons", () => ({
  operatorConfig: new Proxy({}, {
    get: (_target: unknown, prop: string) => ({
      icon: (props: { className?: string }) => <span className={props.className} data-testid={`op-icon-${prop}`}>op</span>,
      labelKey: `operator.${prop}`,
    }),
  }),
}));

import { NumberFilter } from "../../crud/filters/number-filter";
import { SearchOperator } from "../../crud/filters/filter-types";

describe("NumberFilter (extended coverage)", () => {
  it("does not reset operator on clear when no defaultOperator", () => {
    const onOperatorChange = vi.fn();
    render(
      <NumberFilter
        label="Amount"
        value={10}
        operator={SearchOperator.GREATER_THAN}
        onChange={vi.fn()}
        onOperatorChange={onOperatorChange}
        operators={[SearchOperator.EQUALS, SearchOperator.GREATER_THAN]}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onOperatorChange).not.toHaveBeenCalled();
  });

  it("renders hash icon when single operator", () => {
    const { container } = render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    // Single operator shows a span with hash icon instead of dropdown
    const hashSpan = container.querySelector("span.absolute");
    expect(hashSpan).not.toBeNull();
  });

  it("uses default translation key as aria-label when no label", () => {
    render(
      <NumberFilter
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.getByLabelText("filter.numberFilter")).toBeTruthy();
  });

  it("renders operator trigger button with icon when multiple operators", () => {
    render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS, SearchOperator.GREATER_THAN]}
      />,
    );
    const trigger = screen.getByLabelText("filter.selectOperator");
    expect(trigger).toBeTruthy();
    // Should render operator icon inside the trigger
    expect(trigger.querySelector("[data-testid]")).not.toBeNull();
  });

  it("syncs input value when external value changes from number to different number", () => {
    const { rerender } = render(
      <NumberFilter
        label="Amount"
        value={42}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("42");

    rerender(
      <NumberFilter
        label="Amount"
        value={99}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("99");
  });

  it("handles floating point values in input", () => {
    const onChange = vi.fn();
    render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1.5" } });
    expect(onChange).toHaveBeenCalledWith(1.5);
  });
});
