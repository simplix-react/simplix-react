// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { ToggleFilter } from "../../crud/filters/toggle-filter";

describe("ToggleFilter", () => {
  it("renders label", () => {
    render(
      <ToggleFilter label="Active only" value={undefined} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Active only")).toBeTruthy();
  });

  it("shows dashed border when inactive (value=undefined)", () => {
    const { container } = render(
      <ToggleFilter label="Active" value={undefined} onChange={vi.fn()} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-dashed");
  });

  it("shows solid border when active (value=true)", () => {
    const { container } = render(
      <ToggleFilter label="Active" value={true} onChange={vi.fn()} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-solid");
  });

  it("shows solid border when active (value=false)", () => {
    const { container } = render(
      <ToggleFilter label="Active" value={false} onChange={vi.fn()} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-solid");
  });

  it("calls onChange(true) on first click (from undefined)", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ToggleFilter label="Active" value={undefined} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles value on click (from true to false)", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ToggleFilter label="Active" value={true} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("toggles value on click (from false to true)", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ToggleFilter label="Active" value={false} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("shows Yes badge when value is true", () => {
    render(
      <ToggleFilter label="Active" value={true} onChange={vi.fn()} />,
    );
    expect(screen.getByText("common.yes")).toBeTruthy();
  });

  it("shows No badge when value is false", () => {
    render(
      <ToggleFilter label="Active" value={false} onChange={vi.fn()} />,
    );
    expect(screen.getByText("common.no")).toBeTruthy();
  });

  it("calls onChange(undefined) when clear button is clicked", () => {
    const onChange = vi.fn();
    render(
      <ToggleFilter label="Active" value={true} onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("clear button is hidden when value is undefined", () => {
    render(
      <ToggleFilter label="Active" value={undefined} onChange={vi.fn()} />,
    );
    const clearBtn = screen.getByLabelText("filter.clearFilter");
    expect(clearBtn.className).toContain("pointer-events-none");
  });

  it("calls onChange(undefined) when clear is triggered via Enter key", () => {
    const onChange = vi.fn();
    render(
      <ToggleFilter label="Active" value={true} onChange={onChange} />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearFilter"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("calls onChange(undefined) when clear is triggered via Space key", () => {
    const onChange = vi.fn();
    render(
      <ToggleFilter label="Active" value={false} onChange={onChange} />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearFilter"), { key: " " });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("does not clear on unrelated key press", () => {
    const onChange = vi.fn();
    render(
      <ToggleFilter label="Active" value={true} onChange={onChange} />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearFilter"), { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clear button stops propagation to avoid toggling parent", () => {
    const onChange = vi.fn();
    render(
      <ToggleFilter label="Active" value={true} onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    // Should only be called once with undefined, not also with the toggle
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("applies custom className", () => {
    const { container } = render(
      <ToggleFilter label="Active" value={undefined} onChange={vi.fn()} className="my-toggle" />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("my-toggle");
  });

  it("clear button has tabIndex -1 when value is undefined", () => {
    render(
      <ToggleFilter label="Active" value={undefined} onChange={vi.fn()} />,
    );
    const clearBtn = screen.getByLabelText("filter.clearFilter");
    expect(clearBtn.getAttribute("tabindex")).toBe("-1");
  });

  it("clear button has tabIndex 0 when value is set", () => {
    render(
      <ToggleFilter label="Active" value={true} onChange={vi.fn()} />,
    );
    const clearBtn = screen.getByLabelText("filter.clearFilter");
    expect(clearBtn.getAttribute("tabindex")).toBe("0");
  });

  it("badge has opacity-0 when value is undefined", () => {
    const { container } = render(
      <ToggleFilter label="Active" value={undefined} onChange={vi.fn()} />,
    );
    const badge = container.querySelector("[class*='opacity-0']");
    expect(badge).toBeTruthy();
  });
});
