// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PanelHeader } from "../../layout/panel-header";

afterEach(cleanup);

describe("PanelHeader", () => {
  it("renders the title", () => {
    render(<PanelHeader title="Panel Title" />);
    expect(screen.getByText("Panel Title")).toBeDefined();
  });

  it("renders description when provided", () => {
    render(<PanelHeader title="Title" description="Some description" />);
    expect(screen.getByText("Some description")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<PanelHeader title="Title" />);
    const p = container.querySelector("p");
    expect(p).toBeNull();
  });

  it("renders children", () => {
    render(
      <PanelHeader title="Title">
        <span data-testid="child">extra content</span>
      </PanelHeader>,
    );
    expect(screen.getByTestId("child").textContent).toBe("extra content");
  });

  it("renders close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(<PanelHeader title="Title" onClose={onClose} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<PanelHeader title="Title" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not render close button when onClose is not provided", () => {
    render(<PanelHeader title="Title" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
