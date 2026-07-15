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

  it("applies base classes to the wrapper", () => {
    render(<NumberInput data-testid="num" />);
    const wrapper = screen.getByTestId("num").parentElement as HTMLElement;
    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("rounded-md");
    expect(wrapper.className).toContain("border-input");
  });

  it("merges custom className on the wrapper", () => {
    render(<NumberInput data-testid="num" className="my-num" />);
    const wrapper = screen.getByTestId("num").parentElement as HTMLElement;
    expect(wrapper.className).toContain("my-num");
    expect(wrapper.className).toContain("border-input");
  });

  it("renders always-visible spinner buttons", () => {
    render(<NumberInput data-testid="num" />);
    expect(screen.getByRole("button", { name: "Increase" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDefined();
  });

  it("steps up with the spinner button", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" defaultValue={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(onChange).toHaveBeenCalledWith(6);
    expect((screen.getByTestId("num") as HTMLInputElement).value).toBe("6");
  });

  it("steps down with the spinner button respecting step", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" defaultValue={10} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("clamps spinner steps to min/max", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" defaultValue={99} max={99} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(onChange).toHaveBeenCalledWith(99);
  });

  it("lands on min when stepping from an empty input", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min={10} max={99} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("emits the new value for controlled usage without touching the input", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" value={7} onChange={onChange} readOnly />);
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(onChange).toHaveBeenCalledWith(8);
    // Display comes from the controlled prop, unchanged until the parent re-renders
    expect((screen.getByTestId("num") as HTMLInputElement).value).toBe("7");
  });

  it("renders a suffix between the number and the spinner", () => {
    render(<NumberInput data-testid="num" suffix="sec" />);
    const wrapper = screen.getByTestId("num").parentElement as HTMLElement;
    const suffix = screen.getByText("sec");
    expect(suffix.parentElement).toBe(wrapper);
  });

  it("parses decimal input", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" step={0.1} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "2.5" } });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it("disables spinner buttons when disabled", () => {
    render(<NumberInput data-testid="num" disabled />);
    expect((screen.getByRole("button", { name: "Increase" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Decrease" }) as HTMLButtonElement).disabled).toBe(true);
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
