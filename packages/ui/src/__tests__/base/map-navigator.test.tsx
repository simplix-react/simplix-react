// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapNavigator } from "../../base/map/map-navigator";

afterEach(cleanup);

describe("MapNavigator", () => {
  it("renders nothing when total is 0", () => {
    const { container } = render(
      <MapNavigator
        total={0}
        focusedIndex={0}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders navigation UI when total > 0", () => {
    render(
      <MapNavigator
        total={5}
        focusedIndex={0}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    // Shows "01" (padded), and "/ 5"
    expect(screen.getByText("01")).toBeDefined();
    expect(screen.getByText("/ 5")).toBeDefined();
  });

  it("displays formatted focused index", () => {
    render(
      <MapNavigator
        total={20}
        focusedIndex={9}
        label="Building A"
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("Building A")).toBeDefined();
    expect(screen.getByText("/ 20")).toBeDefined();
  });

  it("uses fallbackLabel when label is not provided", () => {
    render(
      <MapNavigator
        total={3}
        focusedIndex={0}
        fallbackLabel="Item #1"
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByText("Item #1")).toBeDefined();
  });

  it("calls onPrev when prev button is clicked", () => {
    const onPrev = vi.fn();
    render(
      <MapNavigator
        total={5}
        focusedIndex={2}
        onPrev={onPrev}
        onNext={vi.fn()}
      />,
    );
    // Find the prev button (first button with svg)
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it("calls onNext when next button is clicked", () => {
    const onNext = vi.fn();
    render(
      <MapNavigator
        total={5}
        focusedIndex={2}
        onPrev={vi.fn()}
        onNext={onNext}
      />,
    );
    const buttons = screen.getAllByRole("button");
    // Last button is "next"
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("calls onSelect when center button is clicked", () => {
    const onSelect = vi.fn();
    render(
      <MapNavigator
        total={3}
        focusedIndex={1}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onSelect={onSelect}
      />,
    );
    // The center button contains the index label
    const centerBtn = screen.getByText("02").closest("button");
    expect(centerBtn).not.toBeNull();
    fireEvent.click(centerBtn!);
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
