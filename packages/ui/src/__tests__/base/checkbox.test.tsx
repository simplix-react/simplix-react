// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Checkbox } from "../../base/checkbox";

afterEach(cleanup);

describe("Checkbox", () => {
  it("renders a checkbox button", () => {
    render(<Checkbox aria-label="agree" />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toBeDefined();
    expect(cb.tagName).toBe("BUTTON");
  });

  it("applies base classes", () => {
    render(<Checkbox aria-label="agree" />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toContain("rounded-sm");
    expect(cb.className).toContain("border-primary");
  });

  it("merges custom className", () => {
    render(<Checkbox aria-label="agree" className="my-checkbox" />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toContain("my-checkbox");
    expect(cb.className).toContain("border-primary");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} aria-label="agree" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("supports disabled state", () => {
    render(<Checkbox aria-label="agree" disabled />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveProperty("disabled", true);
  });

  it("fires onCheckedChange handler", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox aria-label="agree" onCheckedChange={onCheckedChange} />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("toggles checked state", () => {
    render(<Checkbox aria-label="agree" defaultChecked={false} />);
    const cb = screen.getByRole("checkbox");
    expect(cb.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(cb);
    expect(cb.getAttribute("data-state")).toBe("checked");
  });
});
