// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ColorPicker } from "../../base/inputs/color-picker";

afterEach(cleanup);

describe("ColorPicker", () => {
  it("renders trigger button with background color", () => {
    const { container } = render(<ColorPicker value="#ff0000" onChange={vi.fn()} />);
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  it("renders trigger with transparent background when value is empty", () => {
    const { container } = render(<ColorPicker value="" onChange={vi.fn()} />);
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.style.backgroundColor).toBe("transparent");
  });

  it("shows + when no value", () => {
    render(<ColorPicker value="" onChange={vi.fn()} />);
    expect(screen.getByText("+")).toBeDefined();
  });

  it("does not show + when value is set", () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} />);
    expect(screen.queryByText("+")).toBeNull();
  });

  it("applies dashed border when no value", () => {
    const { container } = render(<ColorPicker value="" onChange={vi.fn()} />);
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.className).toContain("border-dashed");
  });

  it("does not apply dashed border when value is set", () => {
    const { container } = render(<ColorPicker value="#ff0000" onChange={vi.fn()} />);
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.className).not.toContain("border-dashed");
  });

  it("supports disabled state", () => {
    const { container } = render(<ColorPicker value="#ff0000" onChange={vi.fn()} disabled />);
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });

  it("applies aria-label to trigger", () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} aria-label="Pick color" />);
    expect(screen.getByLabelText("Pick color")).toBeDefined();
  });

  it("merges custom className on trigger", () => {
    const { container } = render(
      <ColorPicker value="#ff0000" onChange={vi.fn()} className="my-picker" />,
    );
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.className).toContain("my-picker");
  });

  it("opens popover and shows preset colors on click", () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} />);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    // Default 16 preset color buttons + the trigger + clear button
    const allButtons = screen.getAllByRole("button");
    expect(allButtons.length).toBeGreaterThanOrEqual(16);
  });

  it("calls onChange when a preset color is clicked", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    // Click the first preset button (Red #EF4444)
    const presetButtons = screen.getAllByRole("button").filter(
      (btn) => btn.getAttribute("title") !== null,
    );
    expect(presetButtons.length).toBeGreaterThan(0);
    fireEvent.click(presetButtons[0]);
    expect(onChange).toHaveBeenCalledWith("#EF4444");
  });

  it("shows check icon on the selected preset", () => {
    render(<ColorPicker value="#EF4444" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    // The selected color button should contain a check icon SVG
    const redBtn = screen.getByTitle("Red");
    const svg = redBtn.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("shows custom picker input by default", () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    // Popover renders in portal, search document.body
    const colorInput = document.body.querySelector("input[type='color']");
    expect(colorInput).not.toBeNull();
  });

  it("hides custom picker when showCustomPicker=false", () => {
    render(
      <ColorPicker value="#ff0000" onChange={vi.fn()} showCustomPicker={false} />,
    );
    fireEvent.click(screen.getByRole("button"));
    const colorInput = document.body.querySelector("input[type='color']");
    expect(colorInput).toBeNull();
  });

  it("calls onChange with custom color from native picker", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    const colorInput = document.body.querySelector("input[type='color']") as HTMLInputElement;
    expect(colorInput).not.toBeNull();
    fireEvent.change(colorInput, { target: { value: "#00ff00" } });
    expect(onChange).toHaveBeenCalledWith("#00ff00");
  });

  it("shows clear button when clearable and value is set", () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} clearable />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Clear")).toBeDefined();
  });

  it("calls onChange with empty string on clear", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" onChange={onChange} clearable />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Clear"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("hides clear button when clearable=false", () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} clearable={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Clear")).toBeNull();
  });

  it("uses custom renderClear when provided", () => {
    const onChange = vi.fn();
    render(
      <ColorPicker
        value="#ff0000"
        onChange={onChange}
        renderClear={(onClear) => <button onClick={onClear}>Reset</button>}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Reset"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("accepts custom presetColors", () => {
    render(
      <ColorPicker
        value=""
        onChange={vi.fn()}
        presetColors={[
          { value: "#000000", name: "Black" },
          { value: "#ffffff", name: "White" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTitle("Black")).toBeDefined();
    expect(screen.getByTitle("White")).toBeDefined();
  });
});
