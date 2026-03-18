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
    get: () => ({
      icon: ({ className }: { className?: string }) => `<span class="${className}">op</span>`,
      labelKey: "operator.label",
    }),
  }),
}));

import { NumberFilter } from "../../crud/filters/number-filter";
import { SearchOperator } from "../../crud/filters/filter-types";

describe("NumberFilter", () => {
  it("renders with label as aria-label", () => {
    render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.getByLabelText("Amount")).toBeTruthy();
  });

  it("displays current value", () => {
    render(
      <NumberFilter
        label="Amount"
        value={42}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("42");
  });

  it("calls onChange with number when user types valid number", () => {
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
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "123" } });
    expect(onChange).toHaveBeenCalledWith(123);
  });

  it("calls onChange(undefined) when input is cleared", () => {
    const onChange = vi.fn();
    render(
      <NumberFilter
        label="Amount"
        value={42}
        operator={SearchOperator.EQUALS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("shows clear button when value is present", () => {
    render(
      <NumberFilter
        label="Amount"
        value={10}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.getByLabelText("filter.clearFilter")).toBeTruthy();
  });

  it("hides clear button when value is empty", () => {
    render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.queryByLabelText("filter.clearFilter")).toBeNull();
  });

  it("clears input and calls onChange when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <NumberFilter
        label="Amount"
        value={10}
        operator={SearchOperator.EQUALS}
        onChange={onChange}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("uses custom placeholder", () => {
    render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
        placeholder="Enter amount"
      />,
    );
    expect(screen.getByPlaceholderText("Enter amount")).toBeTruthy();
  });

  it("uses label as placeholder fallback", () => {
    render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.getByPlaceholderText("Amount")).toBeTruthy();
  });

  it("uses translation key as placeholder when no label", () => {
    render(
      <NumberFilter
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.getByPlaceholderText("filter.numberPlaceholder")).toBeTruthy();
  });

  it("does not call onChange for NaN input", () => {
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
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "abc" } });
    // onChange should not be called with a number when NaN
    expect(onChange).not.toHaveBeenCalled();
  });

  it("handles zero as a valid number", () => {
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
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("handles negative numbers", () => {
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
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "-5" } });
    expect(onChange).toHaveBeenCalledWith(-5);
  });

  it("handles decimal numbers", () => {
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
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3.14" } });
    expect(onChange).toHaveBeenCalledWith(3.14);
  });

  it("resets operator to defaultOperator on clear", () => {
    const onOperatorChange = vi.fn();
    render(
      <NumberFilter
        label="Amount"
        value={10}
        operator={SearchOperator.GREATER_THAN}
        onChange={vi.fn()}
        onOperatorChange={onOperatorChange}
        operators={[SearchOperator.EQUALS, SearchOperator.GREATER_THAN]}
        defaultOperator={SearchOperator.EQUALS}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onOperatorChange).toHaveBeenCalledWith(SearchOperator.EQUALS);
  });

  it("does not reset operator on clear when already at default", () => {
    const onOperatorChange = vi.fn();
    render(
      <NumberFilter
        label="Amount"
        value={10}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={onOperatorChange}
        operators={[SearchOperator.EQUALS, SearchOperator.GREATER_THAN]}
        defaultOperator={SearchOperator.EQUALS}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onOperatorChange).not.toHaveBeenCalled();
  });

  it("renders operator dropdown trigger when multiple operators", () => {
    render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS, SearchOperator.GREATER_THAN, SearchOperator.LESS_THAN]}
      />,
    );
    expect(screen.getByLabelText("filter.selectOperator")).toBeTruthy();
  });

  it("does not render operator dropdown when single operator", () => {
    render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.queryByLabelText("filter.selectOperator")).toBeNull();
  });

  it("renders with larger left padding when multiple operators", () => {
    const { container } = render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS, SearchOperator.GREATER_THAN]}
      />,
    );
    const input = container.querySelector("input");
    expect(input?.className).toContain("pl-14");
  });

  it("renders with smaller left padding when single operator", () => {
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
    const input = container.querySelector("input");
    expect(input?.className).toContain("pl-8");
  });

  it("applies custom className", () => {
    const { container } = render(
      <NumberFilter
        label="Amount"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
        className="my-filter"
      />,
    );
    expect(container.firstElementChild?.className).toContain("my-filter");
  });

  it("syncs input when value prop changes externally", () => {
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
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("");
  });
});
