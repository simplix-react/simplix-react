// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Textarea } from "../../base/inputs/textarea";
import { drawnClasses } from "../helpers/drawn-classes";

afterEach(cleanup);

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea data-testid="ta" />);
    const ta = screen.getByTestId("ta");
    expect(ta.tagName).toBe("TEXTAREA");
  });

  it("applies base classes", () => {
    render(<Textarea data-testid="ta" />);
    const ta = screen.getByTestId("ta");
    expect(drawnClasses(ta)).toContain("flex");
    expect(drawnClasses(ta)).toContain("rounded-md");
    expect(drawnClasses(ta)).toContain("border-input");
  });

  it("merges custom className", () => {
    render(<Textarea data-testid="ta" className="my-textarea" />);
    const ta = screen.getByTestId("ta");
    expect(drawnClasses(ta)).toContain("my-textarea");
    expect(drawnClasses(ta)).toContain("border-input");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("supports disabled state", () => {
    render(<Textarea data-testid="ta" disabled />);
    const ta = screen.getByTestId("ta");
    expect(ta).toHaveProperty("disabled", true);
  });

  it("renders placeholder", () => {
    render(<Textarea placeholder="Enter message..." />);
    expect(screen.getByPlaceholderText("Enter message...")).toBeDefined();
  });

  it("fires onChange handler", () => {
    const onChange = vi.fn();
    render(<Textarea data-testid="ta" onChange={onChange} />);
    fireEvent.change(screen.getByTestId("ta"), {
      target: { value: "hello" },
    });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("accepts value prop", () => {
    render(<Textarea data-testid="ta" value="content" readOnly />);
    const ta = screen.getByTestId("ta") as HTMLTextAreaElement;
    expect(ta.value).toBe("content");
  });
});
