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

import { DateFilter } from "../../crud/filters/date-filter";
import { SearchOperator } from "../../crud/filters/filter-types";

describe("DateFilter (extended coverage)", () => {
  it("calls onChange(undefined) when clear button is clicked", () => {
    const onChange = vi.fn();
    render(
      <DateFilter
        label="Date"
        value={new Date("2026-06-01")}
        operator={SearchOperator.EQUALS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearDate"));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("calls onChange(undefined) on Enter key on clear button", () => {
    const onChange = vi.fn();
    render(
      <DateFilter
        label="Date"
        value={new Date("2026-06-01")}
        operator={SearchOperator.EQUALS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearDate"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("calls onChange(undefined) on Space key on clear button", () => {
    const onChange = vi.fn();
    render(
      <DateFilter
        label="Date"
        value={new Date("2026-06-01")}
        operator={SearchOperator.EQUALS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearDate"), { key: " " });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("does not clear on unrelated key press", () => {
    const onChange = vi.fn();
    render(
      <DateFilter
        label="Date"
        value={new Date("2026-06-01")}
        operator={SearchOperator.EQUALS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearDate"), { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders operator trigger when multiple operators provided", () => {
    render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS, SearchOperator.GREATER_THAN, SearchOperator.BETWEEN]}
      />,
    );
    expect(screen.getByLabelText("filter.selectOperator")).toBeTruthy();
  });

  it("renders with range value (DateRange)", () => {
    const rangeValue = { from: new Date("2026-01-01"), to: new Date("2026-01-31") };
    render(
      <DateFilter
        label="Date"
        value={rangeValue}
        operator={SearchOperator.BETWEEN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.BETWEEN]}
      />,
    );
    const btn = screen.getAllByRole("button");
    const triggerBtn = btn.find((b) => b.className.includes("border-solid"));
    expect(triggerBtn).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
        className="my-date-filter"
      />,
    );
    expect(container.firstElementChild?.className).toContain("my-date-filter");
  });

  it("uses wider badge for range operators", () => {
    const { container } = render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.BETWEEN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.BETWEEN]}
      />,
    );
    // Check via textContent since CSS class matching can be tricky
    const allSpans = container.querySelectorAll("span, div");
    const hasBadge = Array.from(allSpans).some((el) => el.className.includes("w-[13rem]"));
    expect(hasBadge).toBe(true);
  });

  it("uses narrower badge for single-date operators", () => {
    const { container } = render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    const allSpans = container.querySelectorAll("span, div");
    const hasBadge = Array.from(allSpans).some((el) => el.className.includes("w-[7rem]"));
    expect(hasBadge).toBe(true);
  });

  it("clear button has tabIndex -1 when no value", () => {
    render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearDate");
    expect(clearBtn.getAttribute("tabindex")).toBe("-1");
  });

  it("clear button has tabIndex 0 when value is present", () => {
    render(
      <DateFilter
        label="Date"
        value={new Date("2026-06-01")}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearDate");
    expect(clearBtn.getAttribute("tabindex")).toBe("0");
  });

  it("renders range DateRange with partial from only", () => {
    const rangeValue = { from: new Date("2026-01-01"), to: undefined };
    render(
      <DateFilter
        label="Date"
        value={rangeValue}
        operator={SearchOperator.BETWEEN}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.BETWEEN]}
      />,
    );
    // Should still show solid border since there is a value
    const btn = screen.getAllByRole("button");
    const triggerBtn = btn.find((b) => b.className.includes("border-solid"));
    expect(triggerBtn).toBeTruthy();
  });
});
