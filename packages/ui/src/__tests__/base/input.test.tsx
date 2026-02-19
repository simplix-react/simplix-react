// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Input } from "../../base/input";

afterEach(cleanup);

describe("Input", () => {
  it("renders with default type='text'", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveProperty("type", "text");
  });

  it("applies base classes", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("flex");
    expect(input.className).toContain("rounded-md");
    expect(input.className).toContain("border-input");
  });

  it("accepts custom type", () => {
    render(<Input data-testid="input" type="password" />);
    const input = screen.getByTestId("input");
    expect(input).toHaveProperty("type", "password");
  });

  it("merges custom className", () => {
    render(<Input data-testid="input" className="my-input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("my-input");
    expect(input.className).toContain("border-input");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("supports disabled state", () => {
    render(<Input data-testid="input" disabled />);
    const input = screen.getByTestId("input");
    expect(input).toHaveProperty("disabled", true);
  });

  it("renders placeholder", () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText("Enter text...")).toBeDefined();
  });

  it("fires onChange handler", () => {
    const onChange = vi.fn();
    render(<Input data-testid="input" onChange={onChange} />);
    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "hello" },
    });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("accepts value prop", () => {
    render(<Input data-testid="input" value="test" readOnly />);
    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.value).toBe("test");
  });
});
