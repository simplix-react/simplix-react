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

import { DateNavigator } from "../../base/inputs/date-navigator";

afterEach(cleanup);

describe("DateNavigator", () => {
  const baseDate = new Date(2024, 5, 15); // June 15, 2024

  it("renders prev and next navigation buttons", () => {
    render(<DateNavigator value={baseDate} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Previous day")).toBeDefined();
    expect(screen.getByLabelText("Next day")).toBeDefined();
  });

  it("calls onChange with previous day on prev click", () => {
    const onChange = vi.fn();
    render(<DateNavigator value={baseDate} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Previous day"));
    expect(onChange).toHaveBeenCalledOnce();
    const newDate = onChange.mock.calls[0][0] as Date;
    expect(newDate.getDate()).toBe(14);
  });

  it("calls onChange with next day on next click", () => {
    const onChange = vi.fn();
    render(<DateNavigator value={baseDate} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(onChange).toHaveBeenCalledOnce();
    const newDate = onChange.mock.calls[0][0] as Date;
    expect(newDate.getDate()).toBe(16);
  });

  it("disables prev button when at minDate", () => {
    render(
      <DateNavigator value={baseDate} onChange={vi.fn()} minDate={baseDate} />,
    );
    const prevBtn = screen.getByLabelText("Previous day");
    expect(prevBtn).toHaveProperty("disabled", true);
  });

  it("disables next button when at maxDate", () => {
    render(
      <DateNavigator value={baseDate} onChange={vi.fn()} maxDate={baseDate} />,
    );
    const nextBtn = screen.getByLabelText("Next day");
    expect(nextBtn).toHaveProperty("disabled", true);
  });

  it("disables all buttons when disabled prop is true", () => {
    render(
      <DateNavigator value={baseDate} onChange={vi.fn()} disabled />,
    );
    const prevBtn = screen.getByLabelText("Previous day");
    const nextBtn = screen.getByLabelText("Next day");
    expect(prevBtn).toHaveProperty("disabled", true);
    expect(nextBtn).toHaveProperty("disabled", true);
  });

  it("applies default size classes", () => {
    render(
      <DateNavigator value={baseDate} onChange={vi.fn()} />,
    );
    const prevBtn = screen.getByLabelText("Previous day");
    expect(prevBtn.className).toContain("h-9");
  });

  it("applies sm size classes", () => {
    render(
      <DateNavigator value={baseDate} onChange={vi.fn()} size="sm" />,
    );
    const prevBtn = screen.getByLabelText("Previous day");
    expect(prevBtn.className).toContain("h-7");
  });

  it("merges custom className on wrapper", () => {
    const { container } = render(
      <DateNavigator value={baseDate} onChange={vi.fn()} className="my-nav" />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("my-nav");
    expect(wrapper.className).toContain("inline-flex");
  });

  it("does not navigate when prev is disabled", () => {
    const onChange = vi.fn();
    render(
      <DateNavigator value={baseDate} onChange={onChange} minDate={baseDate} />,
    );
    fireEvent.click(screen.getByLabelText("Previous day"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not navigate when next is disabled", () => {
    const onChange = vi.fn();
    render(
      <DateNavigator value={baseDate} onChange={onChange} maxDate={baseDate} />,
    );
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses current date when value is undefined", () => {
    const onChange = vi.fn();
    render(<DateNavigator value={undefined} onChange={onChange} />);
    // Should still render without error
    const prevBtn = screen.getByLabelText("Previous day");
    expect(prevBtn).toBeDefined();
  });
});
