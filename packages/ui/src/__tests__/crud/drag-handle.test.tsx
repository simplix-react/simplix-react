// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

import { DragHandleCell, DragHandleHeader } from "../../crud/reorder/drag-handle";

describe("DragHandleCell", () => {
  it("renders disabled grip icon when disabled", () => {
    const { container } = render(<DragHandleCell disabled />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    // No interactive button when disabled
    expect(container.querySelector("button")).toBeNull();
  });

  it("renders interactive button when not disabled", () => {
    const listeners = { onPointerDown: vi.fn() };
    const attributes = { role: "button" as const, tabIndex: 0, "aria-roledescription": "sortable", "aria-describedby": "desc", "aria-disabled": false, "aria-pressed": undefined };
    const { container } = render(
      <DragHandleCell listeners={listeners} attributes={attributes} />,
    );
    expect(container.querySelector("button")).toBeTruthy();
  });

  it("has cursor-grab class when interactive", () => {
    const { container } = render(
      <DragHandleCell listeners={{}} attributes={{} as never} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("cursor-grab");
  });
});

describe("DragHandleHeader", () => {
  it("renders a button", () => {
    render(
      <DragHandleHeader isDragEnabled={false} onActivate={vi.fn()} />,
    );
    expect(screen.getByRole("button")).toBeTruthy();
  });

  it("calls onActivate when clicked and drag is not enabled", () => {
    const onActivate = vi.fn();
    render(
      <DragHandleHeader isDragEnabled={false} onActivate={onActivate} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("is disabled when isDragEnabled is true", () => {
    render(
      <DragHandleHeader isDragEnabled={true} onActivate={vi.fn()} />,
    );
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });
});
