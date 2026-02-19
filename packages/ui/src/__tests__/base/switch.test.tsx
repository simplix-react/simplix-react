// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Switch } from "../../base/switch";

afterEach(cleanup);

describe("Switch", () => {
  it("renders a switch", () => {
    render(<Switch aria-label="toggle" />);
    const sw = screen.getByRole("switch");
    expect(sw).toBeDefined();
    expect(sw.tagName).toBe("BUTTON");
  });

  it("applies base classes", () => {
    render(<Switch aria-label="toggle" />);
    const sw = screen.getByRole("switch");
    expect(sw.className).toContain("inline-flex");
    expect(sw.className).toContain("rounded-full");
  });

  it("merges custom className", () => {
    render(<Switch aria-label="toggle" className="my-switch" />);
    const sw = screen.getByRole("switch");
    expect(sw.className).toContain("my-switch");
    expect(sw.className).toContain("rounded-full");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch ref={ref} aria-label="toggle" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("supports disabled state", () => {
    render(<Switch aria-label="toggle" disabled />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveProperty("disabled", true);
  });

  it("fires onCheckedChange handler", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch aria-label="toggle" onCheckedChange={onCheckedChange} />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("toggles state on click", () => {
    render(<Switch aria-label="toggle" defaultChecked={false} />);
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(sw);
    expect(sw.getAttribute("data-state")).toBe("checked");
  });

  it("renders thumb element", () => {
    render(<Switch aria-label="toggle" />);
    const sw = screen.getByRole("switch");
    const thumb = sw.querySelector("span");
    expect(thumb).toBeDefined();
    expect(thumb!.className).toContain("rounded-full");
  });
});
