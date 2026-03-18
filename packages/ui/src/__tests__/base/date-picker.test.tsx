// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "date.pickDate": "Pick a date",
      };
      return map[key] ?? key;
    },
    locale: "en",
    exists: () => false,
  }),
}));

import { DatePicker } from "../../base/inputs/date-picker";

afterEach(cleanup);

describe("DatePicker", () => {
  it("renders trigger button with placeholder", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} />);
    expect(screen.getByText("Pick a date")).toBeDefined();
  });

  it("renders custom placeholder", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} placeholder="Select date" />);
    expect(screen.getByText("Select date")).toBeDefined();
  });

  it("renders formatted date when value is set", () => {
    const { container } = render(<DatePicker value={new Date(2024, 0, 15)} onChange={vi.fn()} />);
    // Should not show the placeholder when a value is selected
    expect(screen.queryByText("Pick a date")).toBeNull();
    // The trigger button has data-empty="false"
    const trigger = container.querySelector("[data-empty='false']") as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.textContent).toContain("15");
  });

  it("renders calendar icon", () => {
    const { container } = render(<DatePicker value={undefined} onChange={vi.fn()} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("supports disabled state", () => {
    const { container } = render(
      <DatePicker value={undefined} onChange={vi.fn()} disabled />,
    );
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });

  it("shows clear button when clearable and value is set", () => {
    render(
      <DatePicker value={new Date(2024, 0, 15)} onChange={vi.fn()} clearable />,
    );
    const clearBtns = screen.getAllByRole("button");
    expect(clearBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("hides clear button when clearable=false", () => {
    const { container } = render(
      <DatePicker
        value={new Date(2024, 0, 15)}
        onChange={vi.fn()}
        clearable={false}
      />,
    );
    // Should not have the X icon clear button
    const xIcons = container.querySelectorAll("[role='button']");
    expect(xIcons.length).toBe(0);
  });

  it("does not show clear button when disabled", () => {
    const { container } = render(
      <DatePicker
        value={new Date(2024, 0, 15)}
        onChange={vi.fn()}
        clearable
        disabled
      />,
    );
    const clearSpans = container.querySelectorAll("[role='button']");
    expect(clearSpans.length).toBe(0);
  });

  it("calls onChange with undefined when clear is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={new Date(2024, 0, 15)} onChange={onChange} />,
    );
    const clearBtn = container.querySelector("[role='button']");
    expect(clearBtn).not.toBeNull();
    fireEvent.click(clearBtn!);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("applies custom className to trigger", () => {
    const { container } = render(
      <DatePicker value={undefined} onChange={vi.fn()} className="my-picker" />,
    );
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.className).toContain("my-picker");
  });

  it("sets data-empty=true when no value", () => {
    const { container } = render(
      <DatePicker value={undefined} onChange={vi.fn()} />,
    );
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.getAttribute("data-empty")).toBe("true");
  });

  it("sets data-empty=false when value is set", () => {
    const { container } = render(
      <DatePicker value={new Date(2024, 0, 15)} onChange={vi.fn()} />,
    );
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.getAttribute("data-empty")).toBe("false");
  });

  it("opens popover on click", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText("Pick a date"));
    // Previous/Next month navigation should be visible
    expect(screen.getByLabelText("Previous month")).toBeDefined();
    expect(screen.getByLabelText("Next month")).toBeDefined();
  });
});
