// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

import { FieldClearButton } from "../../crud/filters/field-clear-button";

describe("FieldClearButton", () => {
  it("renders a button with clear aria-label", () => {
    render(<FieldClearButton onClick={vi.fn()} label="Name" />);
    expect(screen.getByLabelText("Clear Name")).toBeTruthy();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<FieldClearButton onClick={onClick} label="Status" />);
    fireEvent.click(screen.getByLabelText("Clear Status"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders as a button element with type=button", () => {
    render(<FieldClearButton onClick={vi.fn()} label="Test" />);
    const btn = screen.getByLabelText("Clear Test");
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("type")).toBe("button");
  });
});
