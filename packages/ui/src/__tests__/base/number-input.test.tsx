// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NumberInput } from "../../base/inputs/number-input";

afterEach(cleanup);

describe("NumberInput", () => {
  it("renders an input with type=number", () => {
    render(<NumberInput data-testid="num" />);
    const input = screen.getByTestId("num");
    expect(input).toHaveProperty("type", "number");
  });

  it("applies base classes", () => {
    render(<NumberInput data-testid="num" />);
    const input = screen.getByTestId("num");
    expect(input.className).toContain("flex");
    expect(input.className).toContain("rounded-md");
    expect(input.className).toContain("border-input");
  });

  it("merges custom className", () => {
    render(<NumberInput data-testid="num" className="my-num" />);
    const input = screen.getByTestId("num");
    expect(input.className).toContain("my-num");
    expect(input.className).toContain("border-input");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange with parsed integer value", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("does not call onChange for NaN input", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "abc" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clamps value to min", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min={10} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("clamps value to max", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" max={100} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "200" } });
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("clamps value to both min and max", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min={0} max={50} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "-5" } });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("supports disabled state", () => {
    render(<NumberInput data-testid="num" disabled />);
    const input = screen.getByTestId("num");
    expect(input).toHaveProperty("disabled", true);
  });

  it("does not throw when onChange is not provided", () => {
    render(<NumberInput data-testid="num" />);
    // Should not throw
    fireEvent.change(screen.getByTestId("num"), { target: { value: "10" } });
  });

  it("handles string min/max gracefully (no clamping)", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min="5" max="50" onChange={onChange} />);
    // String min/max: typeof min !== "number" so no clamping
    fireEvent.change(screen.getByTestId("num"), { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
